import Imap from "node-imap";
import { simpleParser } from "mailparser";
import axios from "axios";
import { createArticleService } from "../services/index.services";
import { IArticle } from "models/parsed-email.model";

export const imapEmailParserService = () => {
  // Set up the IMAP connection configuration
  const imap = new Imap({
    user: process.env.APP_EMAIL as string,
    password: process.env.APP_PASS as string,
    host: process.env.IMAP_HOST as string,
    port: Number(process.env.IMAP_PORT),
    tls: true,
  });

  imap.once("ready", () => {
    imap.openBox("INBOX", true, (err, box) => {
      if (err) throw err;
      console.log("Connected to INBOX");

      // Listen for new emails
      imap.on("mail", (numNewMsgs) => {
        console.log(`New emails arrived: ${numNewMsgs}`);

        // Fetch the latest email(s)
        const fetch = imap.seq.fetch(
          `${box.messages.total - numNewMsgs + 1}:*`,
          {
            // 12 - 2 + 1 = 11th starting range
            bodies: "",
            struct: true,
          }
        );

        fetch.on("message", (msg) => {
          let buffer = "";

          msg.on("body", (stream) => {
            stream.on("data", (chunk) => {
              buffer += chunk.toString("utf8");
            });

            stream.on("end", async () => {
              try {
                const parsed = await simpleParser(buffer);
                console.log("Subject:", parsed.subject);
                console.log("From:", parsed.from?.text);
                console.log("Body:", parsed.text);
                console.log("Attachments:", parsed.attachments);

                // Prepare email data
                const emailData = {
                  title: parsed.subject,
                  newsletterId: parsed.from?.text
                    .split("<")[1]
                    .trim()
                    .split(">")[0],
                  content: parsed.text,
                };

                const rseponse = createArticleService(emailData as IArticle);

                console.log("rseponse ==> ", rseponse);
                console.log("Article saved successfully to MongoDB");
              } catch (error) {
                console.error("Error parsing or saving email:", error);
              }
            });
          });
        });

        fetch.once("end", () => {
          console.log("Done fetching new emails.");
        });
      });
    });
  });

  imap.once("error", (err) => {
    console.error("IMAP error:", err);
  });

  imap.connect();
};
