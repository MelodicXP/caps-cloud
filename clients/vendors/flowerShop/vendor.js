'use strict';

// Import modules
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
const Chance = require('chance');
const chance = new Chance()

// Initialize AWS SNS client
const snsClient = new SNSClient({ region: 'us-east-1'});

// Define constants
const VENDOR_NAME = 'Flower-Shop';
const VENDOR_URL = 'https://sqs.us-east-1.amazonaws.com/533267271730/flowerShopQueue';  
const PICK_UP_TOPIC_ARN = 'arn:aws:sns:us-east-1:533267271730:pickup.fifo';

// Define pick up details
const pickupDetails = {
  orderId: chance.guid(),
  customer: chance.name({ nationality: 'en'}),
  url: VENDOR_URL //url to vendor sqs
};

// Define SNS parameters
const snsParams = { // parameters needed to send to sns
  Message: JSON.stringify(pickupDetails),
  TopicArn: PICK_UP_TOPIC_ARN,
  MessageGroupId: VENDOR_NAME,
  MessageDeduplicationId: pickupDetails.orderId
}

// Function to publish message to SNS topic
const publishMessage = async () => {
  try {
    const data = await snsClient.send(new PublishCommand(snsParams));
    console.log('Message published: ', data);
  } catch (err) {
    console.error('Could not publish message to topic', err);
  }
};

// Main execution
publishMessage();
