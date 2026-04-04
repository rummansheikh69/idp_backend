import { Banner } from "../models/banner.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { v2 as cloudinary } from "cloudinary";
import nodemailer from "nodemailer";

export const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find({ isAdmin: false }).select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export const deleteUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export const getAllBanners = asyncHandler(async (req, res) => {
  try {
    const banners = await Banner.find();
    res.status(200).json(banners);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export const createBanner = async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ message: "Image is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: "idp",
    });

    const banner = await Banner.create({
      image: uploadResponse.secure_url,
    });

    res.status(201).json(banner);
  } catch (error) {
    console.error("Create banner error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }
    if (banner?.image) {
      const publicId = banner.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }
    await Banner.findByIdAndDelete(id);

    res.status(200).json({ message: "Banner deleted successfully" });
  } catch (error) {
    console.error("Delete banner error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, tag, image } = req.body;
    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "idp",
      });
      if (banner?.image) {
        const publicId = banner.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }
      banner.image = uploadResponse.secure_url;
    }
    banner.title = title || banner.title;
    banner.description = description || banner.description;
    banner.tag = tag || banner.tag;
    await banner.save();
    res.status(200).json(banner);
  } catch (error) {
    console.error("Update banner error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const sendAdmissionEmail = async (req, res) => {
  try {
    // Destructuring all fields from the frontend request
    const {
      admissionDate,
      fullName,
      dob,
      contact,
      family_contact,
      address,
      // Educational 1
      inst1,
      level1,
      dept1,
      gpa1,
      scale1,
      year1,
      // Educational 2
      inst2,
      level2,
      dept2,
      gpa2,
      scale2,
      year2,
      // Course Information
      courseName,
      noOfService,
      startingDate,
      regularFee,
      discount,
      subAgentFee,
      balanceFee,
      // Payment Details
      payDate1,
      payTaka1,
      payDate2,
      payTaka2,
      payDate3,
      payTaka3,
      memoNo,
      branchName,
      paymentType,
      receivedBy,
      admissionOfficer,
      subAgentName,
      // IELTS Registration
      surname,
      givenName,
      testDate,
      testLocation,
      testType,
      registrationDate,
      amount,
      providerName,
      passportNo,
      passportIssueDate,
      passportExpiryDate,
      emailId,
      password,
      // Files
      photo,
      document,
      documentName,
    } = req.body;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_ID,
        pass: process.env.GMAIL_PASS, // Use 16-character App Password
      },
    });

    const emailAttachments = [];

    // Attach Photo (CID for inline display)
    if (photo) {
      emailAttachments.push({
        filename: "candidate-photo.jpg",
        content: photo.split("base64,")[1],
        encoding: "base64",
        cid: "candidatePhoto",
      });
    }

    // Attach Supporting Document
    if (document) {
      emailAttachments.push({
        filename: documentName || "supporting-doc.pdf",
        content: document.split("base64,")[1],
        encoding: "base64",
      });
    }

    const htmlContent = `
    <div
      style="
        font-family: &quot;Segoe UI&quot;, Arial, sans-serif;
        max-width: 800px;
        margin: auto;
        background-color: #ffffff;
      "
    >
      <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        style="
          background-color: #fff;
          border-bottom: 2px solid #111;
          font-family: &quot;Segoe UI&quot;, Arial, sans-serif;
        "
      >
        <tr>
          <td style="padding: 30px 0px; vertical-align: middle">
            <h1
              style="
                color: #111;
                text-transform: uppercase;
                margin: 0;
                font-size: 24px;
                font-weight: bold;
                letter-spacing: 2px;
              "
            >
              ADMISSION FORM
            </h1>
            <p style="color: #71767c; margin: 5px 0 0 0; font-size: 14px">
              Visa Express - Soft Copy
            </p>
          </td>
          <td
            width="120"
            style="padding: 20px 0px; text-align: right; vertical-align: middle"
          >
              <img src="cid:candidatePhoto" width="96" height="128" style="border: 1px solid #0f172a; display: block; margin: 0 auto;" alt="Candidate" />
          </td>
        </tr>
      </table>

      <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        style="
          border: 1px solid #0f172a;
          border-collapse: collapse;
          font-family: &quot;Segoe UI&quot;, Arial, sans-serif;
          margin-top: 20px;
        "
      >
        <tr>
          <td
            colspan="2"
            style="
              background-color: #f1f5f9;
              padding: 8px;
              text-align: center;
              font-weight: bold;
              font-size: 14px;
              border-bottom: 1px solid #0f172a;
              text-transform: uppercase;
              color: #0f172a;
            "
          >
            PERSONAL INFORMATION
          </td>
        </tr>

        <tr>
          <td
            colspan="2"
            style="
              padding: 10px;
              border-bottom: 1px solid #0f172a;
              background-color: #ffffff;
            "
          >
            <label
              style="
                display: block;
                font-size: 10px;
                font-weight: bold;
                color: #000;
                text-transform: uppercase;
              "
              >Admission Date</label
            >
            <div style="font-size: 14px; color: #0f172a; padding-top: 4px">
              ${admissionDate}
            </div>
          </td>
        </tr>

        <tr>
          <td
            width="50%"
            style="
              padding: 10px;
              border-bottom: 1px solid #0f172a;
              border-right: 1px solid #0f172a;
              background-color: #ffffff;
              vertical-align: top;
            "
          >
            <label
              style="
                display: block;
                font-size: 10px;
                font-weight: bold;
                color: #000;
                text-transform: uppercase;
              "
              >Candidate Full Name</label
            >
            <div style="font-size: 14px; color: #0f172a; padding-top: 4px">
              ${fullName}
            </div>
          </td>
          <td
            width="50%"
            style="
              padding: 10px;
              border-bottom: 1px solid #0f172a;
              background-color: #ffffff;
              vertical-align: top;
            "
          >
            <label
              style="
                display: block;
                font-size: 10px;
                font-weight: bold;
                color: #000;
                text-transform: uppercase;
              "
              >Date of Birth</label
            >
            <div style="font-size: 14px; color: #0f172a; padding-top: 4px">
              ${dob}
            </div>
          </td>
        </tr>

        <tr>
          <td
            width="50%"
            style="
              padding: 10px;
              border-bottom: 1px solid #0f172a;
              border-right: 1px solid #0f172a;
              background-color: #ffffff;
              vertical-align: top;
            "
          >
            <label
              style="
                display: block;
                font-size: 10px;
                font-weight: bold;
                color: #000;
                text-transform: uppercase;
              "
              >Contact No</label
            >
            <div style="font-size: 14px; color: #0f172a; padding-top: 4px">
              ${contact}
            </div>
          </td>
          <td
            width="50%"
            style="
              padding: 10px;
              border-bottom: 1px solid #0f172a;
              background-color: #ffffff;
              vertical-align: top;
            "
          >
            <label
              style="
                display: block;
                font-size: 10px;
                font-weight: bold;
                color: #000;
                text-transform: uppercase;
              "
              >Family Contact No</label
            >
            <div style="font-size: 14px; color: #0f172a; padding-top: 4px">
              ${family_contact}
            </div>
          </td>
        </tr>

        <tr>
          <td colspan="2" style="padding: 10px; background-color: #ffffff">
            <label
              style="
                display: block;
                font-size: 10px;
                font-weight: bold;
                color: #000;
                text-transform: uppercase;
              "
              >Full Address</label
            >
            <div style="font-size: 14px; color: #0f172a; padding-top: 4px">
              ${address}
            </div>
          </td>
        </tr>
      </table>

      <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        style="
          border: 1px solid #0f172a;
          border-collapse: collapse;
          font-family: &quot;Segoe UI&quot;, Arial, sans-serif;
          margin-top: 20px;
        "
      >
        <tr>
          <td
            colspan="5"
            style="
              background-color: #f1f5f9;
              padding: 8px;
              text-align: center;
              font-weight: bold;
              font-size: 14px;
              border-bottom: 1px solid #0f172a;
              text-transform: uppercase;
              color: #0f172a;
            "
          >
            Educational Information
          </td>
        </tr>

        <tr
          style="
            background-color: #e2e8f0;
            text-transform: uppercase;
            font-size: 10px;
            font-weight: 900;
          "
        >
          <td
            style="
              padding: 8px;
              border-right: 1px solid #0f172a;
              border-bottom: 1px solid #0f172a;
              width: 35%;
            "
          >
            Institution Name
          </td>
          <td
            style="
              padding: 8px;
              border-right: 1px solid #0f172a;
              border-bottom: 1px solid #0f172a;
              width: 15%;
            "
          >
            Level
          </td>
          <td
            style="
              padding: 8px;
              border-right: 1px solid #0f172a;
              border-bottom: 1px solid #0f172a;
              width: 20%;
            "
          >
            Department
          </td>
          <td
            style="
              padding: 8px;
              border-right: 1px solid #0f172a;
              border-bottom: 1px solid #0f172a;
              width: 15%;
            "
          >
            GPA/CGPA
          </td>
          <td
            style="padding: 8px; border-bottom: 1px solid #0f172a; width: 15%"
          >
            Passing Year
          </td>
        </tr>

        <tr style="font-size: 13px; color: #0f172a">
          <td
            style="
              padding: 8px;
              border-right: 1px solid #0f172a;
              border-bottom: 1px solid #0f172a;
              background-color: #ffffff;
            "
          >
           ${inst1}
          </td>
          <td
            style="
              padding: 8px;
              border-right: 1px solid #0f172a;
              border-bottom: 1px solid #0f172a;
              background-color: #ffffff;
            "
          >
           ${level1}
          </td>
          <td
            style="
              padding: 8px;
              border-right: 1px solid #0f172a;
              border-bottom: 1px solid #0f172a;
              background-color: #ffffff;
            "
          >
            ${dept1}
          </td>
          <td
            style="
              padding: 8px;
              border-right: 1px solid #0f172a;
              border-bottom: 1px solid #0f172a;
              background-color: #ffffff;
            "
          >
            ${gpa1} out of ${scale1}
          </td>
          <td
            style="
              padding: 8px;
              border-bottom: 1px solid #0f172a;
              background-color: #ffffff;
            "
          >
            ${year1}
          </td>
        </tr>

        <tr style="font-size: 13px; color: #0f172a">
          <td
            style="
              padding: 8px;
              border-right: 1px solid #0f172a;
              background-color: #ffffff;
            "
          >
            ${inst2}
          </td>
          <td
            style="
              padding: 8px;
              border-right: 1px solid #0f172a;
              background-color: #ffffff;
            "
          >
            ${level2}
          </td>
          <td
            style="
              padding: 8px;
              border-right: 1px solid #0f172a;
              background-color: #ffffff;
            "
          >
            ${dept2}
          </td>
          <td
            style="
              padding: 8px;
              border-right: 1px solid #0f172a;
              background-color: #ffffff;
            "
          >
            ${gpa2} out of ${scale2}
          </td>
          <td style="padding: 8px; background-color: #ffffff">${year2}</td>
        </tr>
      </table>

      <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        style="
          border: 1px solid #0f172a;
          border-collapse: collapse;
          font-family: &quot;Segoe UI&quot;, Arial, sans-serif;
          margin-top: 20px;
        "
      >
        <tr>
          <td
            colspan="4"
            style="
              background-color: #f1f5f9;
              padding: 8px;
              text-align: center;
              font-weight: bold;
              font-size: 14px;
              border-bottom: 1px solid #0f172a;
              text-transform: uppercase;
              color: #0f172a;
            "
          >
            Course / Service Information
          </td>
        </tr>

        <tr>
          <td
            colspan="2"
            style="
              padding: 8px;
              border-right: 1px solid #0f172a;
              border-bottom: 1px solid #0f172a;
              background-color: #ffffff;
            "
          >
            <span
              style="
                font-size: 11px;
                font-weight: bold;
                text-transform: uppercase;
              "
              >Course/Service Name:</span
            >
            <span style="font-size: 13px; font-weight: 600; padding-left: 5px"
              >${courseName}</span
            >
          </td>
          <td
            style="
              padding: 8px;
              border-right: 1px solid #0f172a;
              border-bottom: 1px solid #0f172a;
              background-color: #ffffff;
            "
          >
            <span
              style="
                font-size: 11px;
                font-weight: bold;
                text-transform: uppercase;
              "
              >No Of Service:</span
            >
            <span style="font-size: 13px; padding-left: 5px"
              >${noOfService}</span
            >
          </td>
          <td
            style="
              padding: 8px;
              border-bottom: 1px solid #0f172a;
              background-color: #ffffff;
            "
          >
            <span
              style="
                font-size: 11px;
                font-weight: bold;
                text-transform: uppercase;
              "
              >Starting Date:</span
            >
            <span style="font-size: 13px; padding-left: 5px"
              >${startingDate}</span
            >
          </td>
        </tr>

        <tr style="background-color: #f8fafc">
          <td
            style="
              padding: 8px;
              border-right: 1px solid #0f172a;
              border-bottom: 1px solid #0f172a;
            "
          >
            <span
              style="
                font-size: 11px;
                font-weight: bold;
                text-transform: uppercase;
              "
              >Regular Fee:</span
            >
            <span style="font-size: 13px; padding-left: 5px"
              >${regularFee}</span
            >
          </td>
          <td
            style="
              padding: 8px;
              border-right: 1px solid #0f172a;
              border-bottom: 1px solid #0f172a;
            "
          >
            <span
              style="
                font-size: 11px;
                font-weight: bold;
                text-transform: uppercase;
              "
              >Discount %:</span
            >
            <span style="font-size: 13px; padding-left: 5px">${discount}</span>
          </td>
          <td
            style="
              padding: 8px;
              border-right: 1px solid #0f172a;
              border-bottom: 1px solid #0f172a;
            "
          >
            <span
              style="
                font-size: 11px;
                font-weight: bold;
                text-transform: uppercase;
              "
              >Sub Agent Fee:</span
            >
            <span style="font-size: 13px; padding-left: 5px"
              >${subAgentFee}</span
            >
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #0f172a">
            <span
              style="
                font-size: 11px;
                font-weight: bold;
                text-transform: uppercase;
              "
              >Balance Fee:</span
            >
            <span
              style="
                font-size: 13px;
                font-weight: bold;
                color: #dc2626;
                padding-left: 5px;
              "
              >${balanceFee}</span
            >
          </td>
        </tr>

        <tr>
          <td
            colspan="1"
            style="
              padding: 0;
              border-right: 1px solid #0f172a;
              border-bottom: 1px solid #0f172a;
              background-color: #ffffff;
            "
          >
            <table width="100%" cellpadding="4" cellspacing="0">
              <tr>
                <td
                  style="
                    font-size: 10px;
                    font-weight: 900;
                    border-bottom: 1px solid #e2e8f0;
                  "
                >
                  1st PAYMENT DATE
                </td>
              </tr>
              <tr>
                <td style="font-size: 12px">${payDate1}</td>
              </tr>
              <tr>
                <td
                  style="
                    font-size: 11px;
                    font-weight: bold;
                    color: #dc2626;
                    border-top: 1px solid #e2e8f0;
                  "
                >
                  TAKA: ${payTaka1}
                </td>
              </tr>
            </table>
          </td>
          <td
            colspan="2"
            style="
              padding: 0;
              border-right: 1px solid #0f172a;
              border-bottom: 1px solid #0f172a;
              background-color: #ffffff;
            "
          >
            <table width="100%" cellpadding="4" cellspacing="0">
              <tr>
                <td
                  style="
                    font-size: 10px;
                    font-weight: 900;
                    border-bottom: 1px solid #e2e8f0;
                  "
                >
                  2nd PAYMENT DATE
                </td>
              </tr>
              <tr>
                <td style="font-size: 12px">${payDate2}</td>
              </tr>
              <tr>
                <td
                  style="
                    font-size: 11px;
                    font-weight: bold;
                    color: #dc2626;
                    border-top: 1px solid #e2e8f0;
                  "
                >
                  TAKA: ${payTaka2}
                </td>
              </tr>
            </table>
          </td>
          <td
            colspan="1"
            style="
              padding: 0;
              border-bottom: 1px solid #0f172a;
              background-color: #ffffff;
            "
          >
            <table width="100%" cellpadding="4" cellspacing="0">
              <tr>
                <td
                  style="
                    font-size: 10px;
                    font-weight: 900;
                    border-bottom: 1px solid #e2e8f0;
                  "
                >
                  3rd PAYMENT DATE
                </td>
              </tr>
              <tr>
                <td style="font-size: 12px">${payDate3}</td>
              </tr>
              <tr>
                <td
                  style="
                    font-size: 11px;
                    font-weight: bold;
                    color: #dc2626;
                    border-top: 1px solid #e2e8f0;
                  "
                >
                  TAKA: ${payTaka3}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td
            style="
              padding: 8px;
              border-right: 1px solid #0f172a;
              border-bottom: 1px solid #0f172a;
              background-color: #ffffff;
            "
          >
            <span
              style="
                font-size: 11px;
                font-weight: bold;
                text-transform: uppercase;
              "
              >Memo No:</span
            >
            <span style="font-size: 13px; padding-left: 5px">${memoNo}</span>
          </td>
          <td
            style="
              padding: 8px;
              border-right: 1px solid #0f172a;
              border-bottom: 1px solid #0f172a;
              background-color: #ffffff;
            "
          >
            <span
              style="
                font-size: 11px;
                font-weight: bold;
                text-transform: uppercase;
              "
              >Branch Name:</span
            >
            <span style="font-size: 13px; padding-left: 5px"
              >${branchName}</span
            >
          </td>
          <td
          
            style="
              padding: 8px;
              border-right: 1px solid #0f172a;
              border-bottom: 1px solid #0f172a;
              background-color: #ffffff;
            "
          >
            <span
              style="
                font-size: 11px;
                font-weight: bold;
                text-transform: uppercase;
              "
              >Type Of Payment:</span
            >
            <span style="font-size: 13px; padding-left: 5px"
              >${paymentType}</span
            >
          </td>
          <td
            style="
              padding: 8px;
              border-bottom: 1px solid #0f172a;
              background-color: #ffffff;
            "
          >
            <span
              style="
                font-size: 11px;
                font-weight: bold;
                text-transform: uppercase;
              "
              >Received By:</span
            >
            <span style="font-size: 13px; padding-left: 5px"
              >${receivedBy}</span
            >
          </td>
        </tr>

        <tr>
          <td
            colspan="2"
            style="
              padding: 8px;
              border-right: 1px solid #0f172a;
              background-color: #ffffff;
            "
          >
            <span
              style="
                font-size: 11px;
                font-weight: bold;
                text-transform: uppercase;
              "
              >Admissions Officer:</span
            >
            <span style="font-size: 13px; padding-left: 5px"
              >${admissionOfficer}</span
            >
          </td>
          <td colspan="2" style="padding: 8px; background-color: #ffffff">
            <span
              style="
                font-size: 11px;
                font-weight: bold;
                text-transform: uppercase;
              "
              >Sub Agent Name:</span
            >
            <span style="font-size: 13px; padding-left: 5px"
              >${subAgentName}</span
            >
          </td>
        </tr>
      </table>

      <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        style="
          border: 1px solid #0f172a;
          border-collapse: collapse;
          font-family: &quot;Segoe UI&quot;, Arial, sans-serif;
          margin-top: 20px;
        "
      >
        <tr>
          <td
            colspan="3"
            style="
              background-color: #f1f5f9;
              padding: 8px;
              text-align: center;
              font-weight: bold;
              font-size: 14px;
              border-bottom: 1px solid #0f172a;
              text-transform: uppercase;
              color: #0f172a;
            "
          >
            IELTS Registration Information
          </td>
        </tr>

        <tr>
          <td
            width="50%"
            colspan="1"
            style="
              padding: 8px;
              border-right: 1px solid #0f172a;
              border-bottom: 1px solid #0f172a;
              background-color: #ffffff;
            "
          >
            <span
              style="
                font-size: 11px;
                font-weight: bold;
                text-transform: uppercase;
              "
              >Surname:</span
            >
            <span style="font-size: 13px; padding-left: 5px">${surname}</span>
          </td>
          <td
            width="50%"
            colspan="2"
            style="
              padding: 8px;
              border-bottom: 1px solid #0f172a;
              background-color: #ffffff;
            "
          >
            <span
              style="
                font-size: 11px;
                font-weight: bold;
                text-transform: uppercase;
              "
              >Given Name:</span
            >
            <span style="font-size: 13px; padding-left: 5px"
              >${givenName}</span
            >
          </td>
        </tr>

        <tr>
          <td
            width="33.3%"
            style="
              padding: 8px;
              border-right: 1px solid #0f172a;
              border-bottom: 1px solid #0f172a;
              background-color: #ffffff;
            "
          >
            <div
              style="
                font-size: 9px;
                font-weight: bold;
                text-transform: uppercase;
              "
            >
              Test Date:
            </div>
            <div style="font-size: 13px; padding-top: 2px">${testDate}</div>
          </td>
          <td
            width="33.3%"
            style="
              padding: 8px;
              border-right: 1px solid #0f172a;
              border-bottom: 1px solid #0f172a;
              background-color: #ffffff;
            "
          >
            <div
              style="
                font-size: 9px;
                font-weight: bold;
                text-transform: uppercase;
              "
            >
              Test Location:
            </div>
            <div style="font-size: 13px; padding-top: 2px">
              ${testLocation}
            </div>
          </td>
          <td
            width="33.3%"
            style="
              padding: 8px;
              border-bottom: 1px solid #0f172a;
              background-color: #ffffff;
            "
          >
            <div
              style="
                font-size: 9px;
                font-weight: bold;
                text-transform: uppercase;
              "
            >
              Test Type:
            </div>
            <div style="font-size: 13px; padding-top: 2px">${testType}</div>
          </td>
        </tr>

        <tr>
          <td
            style="
              padding: 8px;
              border-right: 1px solid #0f172a;
              border-bottom: 1px solid #0f172a;
              background-color: #ffffff;
            "
          >
            <div
              style="
                font-size: 9px;
                font-weight: bold;
                text-transform: uppercase;
              "
            >
              Registration Date:
            </div>
            <div style="font-size: 13px; padding-top: 2px">
              ${registrationDate}
            </div>
          </td>
          <td
            style="
              padding: 8px;
              border-right: 1px solid #0f172a;
              border-bottom: 1px solid #0f172a;
              background-color: #ffffff;
            "
          >
            <div
              style="
                font-size: 9px;
                font-weight: bold;
                text-transform: uppercase;
              "
            >
              Amount:
            </div>
            <div style="font-size: 13px; padding-top: 2px">${amount}</div>
          </td>
          <td
            style="
              padding: 8px;
              border-bottom: 1px solid #0f172a;
              background-color: #ffffff;
            "
          >
            <div
              style="
                font-size: 9px;
                font-weight: bold;
                text-transform: uppercase;
              "
            >
              Provider Name:
            </div>
            <div style="font-size: 13px; padding-top: 2px">
              ${providerName}
            </div>
          </td>
        </tr>

        <tr>
          <td
            style="
              padding: 8px;
              border-right: 1px solid #0f172a;
              border-bottom: 1px solid #0f172a;
              background-color: #ffffff;
            "
          >
            <div
              style="
                font-size: 9px;
                font-weight: bold;
                text-transform: uppercase;
              "
            >
              Passport No:
            </div>
            <div style="font-size: 13px; padding-top: 2px">${passportNo}</div>
          </td>
          <td
            style="
              padding: 8px;
              border-right: 1px solid #0f172a;
              border-bottom: 1px solid #0f172a;
              background-color: #ffffff;
            "
          >
            <div
              style="
                font-size: 9px;
                font-weight: bold;
                text-transform: uppercase;
              "
            >
              Issue Date:
            </div>
            <div style="font-size: 13px; padding-top: 2px">
              ${passportIssueDate}
            </div>
          </td>
          <td
            style="
              padding: 8px;
              border-bottom: 1px solid #0f172a;
              background-color: #ffffff;
            "
          >
            <div
              style="
                font-size: 9px;
                font-weight: bold;
                text-transform: uppercase;
              "
            >
              Expiry Date:
            </div>
            <div style="font-size: 13px; padding-top: 2px">
              ${passportExpiryDate}
            </div>
          </td>
        </tr>

        <tr>
          <td
            colspan="1"
            style="
              padding: 8px;
              border-right: 1px solid #0f172a;
              background-color: #ffffff;
            "
          >
            <span
              style="
                font-size: 11px;
                font-weight: bold;
                text-transform: uppercase;
              "
              >Email ID:</span
            >
            <span style="font-size: 13px; padding-left: 5px">${emailId}</span>
          </td>
          <td colspan="2" style="padding: 8px; background-color: #ffffff">
            <span
              style="
                font-size: 11px;
                font-weight: bold;
                text-transform: uppercase;
              "
              >Password:</span
            >
            <span style="font-size: 13px; padding-left: 5px">${password}</span>
          </td>
        </tr>
      </table>
    </div>
    `;

    const mailOptions = {
      from: `"Admission of ${fullName}" <${process.env.GMAIL_ID}>`,
      to: process.env.RECEIVER_EMAIL,
      subject: `New Student Admission: ${fullName}`,
      html: htmlContent,
      attachments: emailAttachments,
    };

    await transporter.sendMail(mailOptions);
    res
      .status(200)
      .json({ success: true, message: "Admission processing complete!" });
  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
