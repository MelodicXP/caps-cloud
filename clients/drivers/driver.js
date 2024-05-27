'use strict';

// Import modules
const { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } = require('@aws-sdk/client-sqs');

//Configure SQS client
const sqsClient = new SQSClient({ region: 'us-east-1'});

//Define SQS url
const QUEUE_URL = 'https://sqs.us-east-1.amazonaws.com/533267271730/packages.fifo';

// Define SQS parameters to receive a message
const sqsParams = {
  QueueUrl: QUEUE_URL,
  MaxNumberOfMessages: 1,
  WaitTimeSeconds: 10,
};

// Function to receive and delete messages from the SQS queue
const processMessages = async () => {
  try {
    // Receive a message from the SQS queue
    const receiveCommand = new ReceiveMessageCommand(sqsParams);
    const receiveResponse = await sqsClient.send(receiveCommand);

    if (receiveResponse.Messages && receiveResponse.Messages.length > 0) {
      const message = receiveResponse.Messages[0];
      const receiptHandle = message.ReceiptHandle;

      // Log the received message
      console.log('Package received:', message.Body);

      // Parameters for deleting the message
      const deleteParams = {
        QueueUrl: QUEUE_URL,
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
processMessages();

// { // ReceiveMessageResult
//   Messages: [ // MessageList
//     { // Message
//       MessageId: "STRING_VALUE",
//       ReceiptHandle: "STRING_VALUE",
//       MD5OfBody: "STRING_VALUE",
//       Body: "STRING_VALUE",
//       Attributes: { // MessageSystemAttributeMap
//         "<keys>": "STRING_VALUE",
//       },
//       MD5OfMessageAttributes: "STRING_VALUE",
//       MessageAttributes: { // MessageBodyAttributeMap
//         "<keys>": { // MessageAttributeValue
//           StringValue: "STRING_VALUE",
//           BinaryValue: new Uint8Array(),
//           StringListValues: [ // StringList
//             "STRING_VALUE",
//           ],
//           BinaryListValues: [ // BinaryList
//             new Uint8Array(),
//           ],
//           DataType: "STRING_VALUE", // required
//         },
//       },
//     },
//   ],
// };