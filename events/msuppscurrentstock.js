// module.exports = function calculateCurrentStock(tunnel) {
//   const now = Date.now();
//   const last = new Date(tunnel.last_updated_at).getTime();

//   const hoursPassed = (now - last) / (1000 * 60 * 60);
//   const burned = tunnel.burn_rate_per_hour * hoursPassed;

//   const remaining = Math.max(0, tunnel.current_stock - burned);

//   return {
//     remaining,
//     hoursPassed
//   };
// };