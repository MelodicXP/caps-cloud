'use strict';

// Import modules
const { 
  SNSClient, 
  PublishCommand 
} = require('@aws-sdk/client-sns');

const { 
  SQSClient, 
  ReceiveMessageCommand, 
  DeleteMessageCommand
} = require('@aws-sdk/client-sqs');

const Chance = require('chance');
const chance = new Chance()

// Configure AWS SNS client
const snsClient = new SNSClient({ region: 'us-east-1'});

//Configure SQS client
const sqsClient = new SQSClient({ region: 'us-east-1'});

// Define constants
const VENDOR_NAME = 'Flower-Shop';
const VENDOR_URL = 'https://sqs.us-east-1.amazonaws.com/533267271730/flowerShopQueue';  // SQS URL 
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

// Function to receive, process, and send messages from SQS queue
const processMessages = async () => {
  try {
    // Define SQS parameters to receive a message
    const sqsParams = {
      QueueUrl: VENDOR_URL,
      MaxNumberOfMessages: 1,
      WaitTimeSeconds: 10,
    };

    // Receive a message from the SQS queue
    const receiveCommand = new ReceiveMessageCommand(sqsParams);
    const receiveResponse = await sqsClient.send(receiveCommand);

    if (receiveResponse.Messages && receiveResponse.Messages.length > 0) {
      const message = receiveResponse.Messages[0];
      const receiptHandle = message.ReceiptHandle;

      // Log the received message
      console.log('Received The Following Delivery Confirmation:', message.Body);

      // Parameters for deleting the message
      const deleteParams = {
        QueueUrl: VENDOR_URL,
        ReceiptHandle: receiptHandle,
      };

      // Delete the message from the SQS queue
      const deleteCommand = new DeleteMessageCommand(deleteParams);
      await sqsClient.send(deleteCommand);

      console.log('Message deleted successfully');
    } else {
      console.log('No messages to process');
    }
  } catch (error) {
    console.error('Error processing messages:', error);
  }
};

// Main execution
publishMessage();
processMessages();
