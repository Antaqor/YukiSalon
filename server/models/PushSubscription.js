const mongoose = require('mongoose');
const { Schema, model, models } = mongoose;

const PushSubscriptionSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  endpoint: { type: String, required: true },
  keys: {
    p256dh: String,
    auth: String
  }
});

module.exports = models.PushSubscription || model('PushSubscription', PushSubscriptionSchema);
