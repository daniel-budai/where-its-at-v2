import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { db } from "../../services/dynamodb";
import { success } from "../responses/success";
import { error } from "../responses/error";

const docClient = DynamoDBDocumentClient.from(db);

export const handler = async (event: any) => {
  try {
    const result = await docClient.send(
      new ScanCommand({
        TableName: process.env.TABLE_NAME,
      })
    );

    return success({ events: result.Items });
  } catch (err) {
    console.error("Error getting events:", err);
    return error("Could not retrieve events");
  }
};
