import nodemailer from "nodemailer";

export async function sendMail(payload: { email: string; approved: boolean; customer: boolean }) {
  const { email, approved, customer } = payload;

  const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  let emailHtml = "";
  let subject = "";

  if (approved && customer) { 
    emailHtml = "<p>Your profile has been verified.</p>"; 
    subject = "Profile Verification"; 
  } else if (approved && !customer) { 
    emailHtml = "<p>Your profile has been verified. To complete the process, you need to register.</p>"; 
    subject = "Profile Verification - Registration Required"; 
  } else { 
    emailHtml = "<p>Your profile has not been verified.</p>"; 
    subject = "Profile Not Verified"; 
  }
  

  const mailOptions = {
    from: process.env.EMAIL_SENDER,
    to: email,
    subject,
    html: emailHtml,
  };

  try {
    const info = await transport.sendMail(mailOptions);
    console.log("Email was sent to " + email, info.response);

    return { success: true, message: "Email was sent" };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, message: "Failed to send email", error };
  }
}
