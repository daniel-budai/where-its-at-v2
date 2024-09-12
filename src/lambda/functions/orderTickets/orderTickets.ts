import {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { db } from "../../services/dynamodb";
import { success } from "../responses/success";
import { error } from "../responses/error";
import { v4 as uuidv4 } from "uuid";

const docClient = DynamoDBDocumentClient.from(db);

export const handler = async (event: any) => {
  try {
    const { eventId } = JSON.parse(event.body);

    // Get event details
    const eventResult = await docClient.send(
      new GetCommand({
        TableName: process.env.TABLE_NAME,
        Key: {
          PK: `EVENT#${eventId}`,
          SK: `EVENT#${eventId}`,
        },
      })
    );

    if (!eventResult.Item) {
      return error("Event not found", 404);
    }

    const eventData = eventResult.Item;

    // Generate ticket number
    const ticketNumber = uuidv4();

    // Create ticket entry
    await docClient.send(
      new UpdateCommand({
        TableName: process.env.TABLE_NAME,
        Key: {
          PK: `EVENT#${eventId}`,
          SK: `TICKET#${ticketNumber}`,
        },
        UpdateExpression:
          "SET ticketNumber = :tn, eventId = :eid, #status = :status",
        ExpressionAttributeNames: {
          "#status": "status",
        },
        ExpressionAttributeValues: {
          ":tn": ticketNumber,
          ":eid": eventId,
          ":status": "valid",
        },
      })
    );

    // Return event information and ticket number
    return success({
      message: "Ticket booked successfully",
      ticketNumber,
      event: {
        id: eventData.id,
        name: eventData.name,
        date: eventData.date,
        location: eventData.location,
        time: eventData.time,
        price: eventData.price,
      },
    });
  } catch (err) {
    console.error("Error booking ticket:", err);
    return error("Could not book ticket");
  }
};
