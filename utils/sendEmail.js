const nodemailer = require("nodemailer");

// async..await is not allowed in global scope, must use a wrapper
const sendEmail = async (email, message) => {
  // create reusable transporter object using the default SMTP transport
  //   betatestersproduct@gmail.com
  //   BetaTesters2022
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "matchermeet@gmail.com",
      pass: "Elephantus@468",
    },
  });
  let mailPayload = {
    from: "matchermeet@gmail.com",
    to: email,
    subject: "Password resetting",
    html: `<p>${message}</p>`,
  };

  transporter.sendMail(mailPayload, function (error, data) {
    if (error) throw Error(error);
    console.log("Email sent successfully");
    console.log(data);
  });
};

module.exports = sendEmail;
