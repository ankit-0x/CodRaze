const redisClient = require("../config/redis");

const submitCodeRateLimiter = async (req, res, next) => {
  try {
    const userId = req.result._id;

    const redisKey = `submit_cooldown:${userId}`;

    // Check if user is already on cooldown
    const exists = await redisClient.exists(redisKey);

    if (exists) {
      const ttl = await redisClient.ttl(redisKey);

      return res.status(429).json({
        error: `Please wait ${ttl} seconds before submitting again.`,
      });
    }

    // // Set 10 second cooldown
    // await redisClient.set(redisKey, "cooldown_active", {
    //   EX: 10, // Expire after 10 seconds
    //   NX: true, // only set if not exists
    // });

    next();
  } catch (error) {
    console.error("Rate limiter error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

module.exports = submitCodeRateLimiter;