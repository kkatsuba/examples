const webPush = require('web-push');

const subscriptions = [];
const subject = 'http://localhost:5000';
const privateKey = '1tiGtD5dYS3KDw0EKruiFKLTQoX_4CbSvX99loDiCLI';
const publicKey = 'BI4VPQqyyJbIA-f95VqbjUAOYNhhCAxV6XP_nCMvGkB6i4pgrPrK54N9qTmzI6NNfhmgDGlttACcx3KjjnBhs20';

webPush.setVapidDetails(subject, publicKey, privateKey);

module.exports = (app) => {
  app.post('/subscribe', (req, res) => {
    const sub = req.body;
    subscriptions.push(sub);
  
    webPush.sendNotification(sub, JSON.stringify({
      title: 'Some Title',
      body: 'You have been subscribed to notifications. Enjoy!!'
    }))
  
    res.sendStatus(200);
  });
  
  app.post('/send/all', (req, res) => {
    subscriptions.forEach(sub => {
      webPush.sendNotification(sub, JSON.stringify(req.body));
    });
    res.sendStatus(200);
  });
};
