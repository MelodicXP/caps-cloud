'use strict';

// Import modules
const { SQSClient, ReceiveMessageCommand, DeleteMessageCommand, SendMessageCommand } = require('@aws-sdk/client-sqs');

//Configure SQS client
const sqsClient = new SQSClient({ region: 'us-east-1'});

// Define SQS url
const QUEUE_URL = 'https://sqs.us-east-1.amazonaws.com/533267271730/packages.fifo';

// Function to receive, process and send messages from the SQS queue
const processMessages = async () => {
  try {
    // Define SQS parameters to receive a message
    const sqsParams = {
      QueueUrl: QUEUE_URL,
      MaxNumberOfMessages: 1,
      WaitTimeSeconds: 5,
    };

    // Receive a message from the SQS queue
    const receiveCommand = new ReceiveMessageCommand(sqsParams);
    const receiveResponse = await sqsClient.send(receiveCommand);

    if (receiveResponse.Messages && receiveResponse.Messages.length > 0) {
      const message = receiveResponse.Messages[0];
      const receiptHandle = message.ReceiptHandle;

      // Log the received message
      console.log('Package received:', message.Body);

      // Parse the JSON message body
      const parsedMessageBody = JSON.parse(message.Body);
      const parsedMessage = JSON.parse(parsedMessageBody.Message);
      console.log('parsedMessage:', parsedMessage);
      const orderId = parsedMessage.orderId;
      const url = parsedMessage.url;

      // Log the extracted details, url used to send to vendor SQS queue
      console.log(`Order ID: ${orderId}`);
      console.log(`URL: ${url}`);

      // Build the new message to send to vendor SQS queue
      const deliveredMessage = `Package for order id ${orderId}, has been delivered`;

      // Parameters for sending a new message
      const sendParams = {
        QueueUrl: url, // Use the extracted URL
        MessageBody: deliveredMessage,
      };

       // Send delivered message to the vendor SQS queue
       const sendCommand = new SendMessageCommand(sendParams);
       const sendResponse = await sqsClient.send(sendCommand);
       console.log('Message sent:', sendResponse);

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

function startDriver () {
  setInterval(() => {
    processMessages();
  }, 10000);
}

startDriver();

// module.exports = startDriver;

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