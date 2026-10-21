// controllers/assetController.js
import https from 'https';
import http from 'http';
import jwt from 'jsonwebtoken';
import Asset from '../models/Asset.js';

const VALID_TYPES = ['image', 'video', 'audio'];
const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 40;

/**
 * GET /api/assets?type=image|video|audio&page=1&limit=40
 * Returns paginated assets for the current user, newest first.
 */
export const listAssets = async (req, res) => {
  try {
    const { type } = req.query;

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, parseInt(req.query.limit, 10) || DEFAULT_LIMIT)
    );
    const skip = (page - 1) * limit;

    const filter = { userId: req.user.id };
    if (type) {
      if (!VALID_TYPES.includes(type)) {
        return res.status(400).json({
          error: `Invalid type. Expected one of: ${VALID_TYPES.join(', ')}`,
        });
      }
      filter.type = type;
    }

    const [assets, total] = await Promise.all([
      Asset.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        // creditsCost is included so the UI can show a per-asset cost badge
        .select('_id type prompt cloudinaryUrl creditsCost kind createdAt')
        .lean(),
      Asset.countDocuments(filter),
    ]);

    res.json({
      assets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    console.error('List assets error:', err);
    res.status(500).json({ error: 'Failed to load library' });
  }
};

/**
 * GET /api/assets/stats
 * Returns counts and credit totals per type for the current user.
 */
export const getAssetStats = async (req, res) => {
  try {
    const rows = await Asset.aggregate([
      { $match: { userId: req.user.id } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          creditsUsed: { $sum: { $ifNull: ['$creditsCost', 0] } },
        },
      },
    ]);

    const stats = {
      image: { count: 0, creditsUsed: 0 },
      video: { count: 0, creditsUsed: 0 },
      audio: { count: 0, creditsUsed: 0 },
      total: { count: 0, creditsUsed: 0 },
    };

    rows.forEach((r) => {
      if (VALID_TYPES.includes(r._id)) {
        stats[r._id].count = r.count;
        stats[r._id].creditsUsed = r.creditsUsed || 0;
        stats.total.count += r.count;
        stats.total.creditsUsed += r.creditsUsed || 0;
      }
    });

    res.json({ stats });
  } catch (err) {
    console.error('Asset stats error:', err);
    res.status(500).json({ error: 'Failed to load stats' });
  }
};

/**
 * DELETE /api/assets/:id
 * Only the owner can delete. Cloudinary file is left in place.
 */
export const deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const asset = await Asset.findOne({ _id: id, userId: req.user.id });
    if (!asset) return res.status(404).json({ error: 'Asset not found' });

    await asset.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    console.error('Delete asset error:', err);
    res.status(500).json({ error: 'Failed to delete' });
  }
};

/**
 * GET /api/assets/:id/stream?token=<jwt>
 * Streams the Cloudinary file through the backend after auth.
 * Prevents the raw Cloudinary URL from ever being visible in the browser.
 * Accepts token via query param so <audio>/<video> can auth without headers.
 */
export const streamAsset = async (req, res) => {
  try {
    const { id } = req.params;

    // Auth
    if (!req.user) {
      const { token } = req.query;
      if (!token) return res.status(401).json({ error: 'Unauthorized' });
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.id };
      } catch {
        return res.status(401).json({ error: 'Invalid token' });
      }
    }

    const asset = await Asset.findOne({ _id: id, userId: req.user.id }).lean();
    if (!asset) return res.status(404).json({ error: 'Asset not found' });

    // Build the upstream request options BEFORE calling .get()
    const upstreamHeaders = {};
    if (req.headers.range) {
      upstreamHeaders.Range = req.headers.range;
    }

    const client = asset.cloudinaryUrl.startsWith('https') ? https : http;

    const upstreamReq = client.get(
      asset.cloudinaryUrl,
      { headers: upstreamHeaders },
      (upstream) => {
        if (res.headersSent) {
          upstream.destroy();
          return;
        }

        res.status(upstream.statusCode || 200);

        const passthrough = [
          'content-type',
          'content-range',
          'accept-ranges',
          'cache-control',
          'last-modified',
          'etag',
        ];
        for (const h of passthrough) {
          if (upstream.headers[h]) res.setHeader(h, upstream.headers[h]);
        }

        if (upstream.headers['content-length']) {
          res.setHeader('Content-Length', upstream.headers['content-length']);
        }

        upstream.pipe(res);

        upstream.on('error', (err) => {
          console.error('Upstream stream error:', err.message);
          if (!res.headersSent) res.status(502).json({ error: 'Stream failed' });
          else res.destroy();
        });
      }
    );

    upstreamReq.on('error', (err) => {
      console.error('Upstream request error:', err.message);
      if (!res.headersSent) res.status(502).json({ error: 'Stream failed' });
    });

    req.on('close', () => {
      if (!upstreamReq.destroyed) upstreamReq.destroy();
    });
  } catch (err) {
    console.error('Stream route error:', err);
    if (!res.headersSent) res.status(500).json({ error: 'Stream failed' });
  }
};