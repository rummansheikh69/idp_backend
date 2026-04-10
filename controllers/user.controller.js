import { Banner } from "../models/banner.js";
import { Gallery } from "../models/gallery.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { v2 as cloudinary } from "cloudinary";
import nodemailer from "nodemailer";

const APPLICATION_EMAIL = "infovisaexpressbd@gmail.com";
const COUNSELLING_EMAIL = "khulna@visaexpressbd.com";

export const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find({ isAdmin: false })
      .sort({ createdAt: -1 })
      .select("-password");
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
    const { image, title, description, tag } = req.body;

    if (!image) {
      return res.status(400).json({ message: "Image is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: "idp",
    });

    const banner = await Banner.create({
      image: uploadResponse.secure_url,
      title,
      description,
      tag,
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

export const getAllGalleryItems = asyncHandler(async (req, res) => {
  try {
    const galleryItems = await Gallery.find().sort({ createdAt: -1 });
    res.status(200).json(galleryItems);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export const addGallery = async (req, res) => {
  try {
    const { image, title, description } = req.body;
    if (!image) {
      return res.status(400).json({ message: "Image is required" });
    }
    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: "idp",
    });
    const galleryItem = await Gallery.create({
      image: uploadResponse.secure_url,
      title,
      description,
    });
    res.status(201).json(galleryItem);
  } catch (error) {
    console.error("Create gallery error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteGallery = async (req, res) => {
  try {
    const { id } = req.params;
    const galleryItem = await Gallery.findById(id);
    if (!galleryItem) {
      return res.status(404).json({ message: "Gallery item not found" });
    }
    if (galleryItem?.image) {
      const publicId = galleryItem.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }
    await Gallery.findByIdAndDelete(id);
    res.status(200).json({ message: "Gallery item deleted successfully" });
  } catch (error) {
    console.error("Delete gallery error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateGallery = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, image } = req.body;
    const galleryItem = await Gallery.findById(id);
    if (!galleryItem) {
      return res.status(404).json({ message: "Gallery item not found" });
    }
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "idp",
      });
      if (galleryItem?.image) {
        const publicId = galleryItem.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }
      galleryItem.image = uploadResponse.secure_url;
    }
    galleryItem.title = title || galleryItem.title;
    galleryItem.description = description || galleryItem.description;
    await galleryItem.save();
    res.status(200).json(galleryItem);
  } catch (error) {
    console.error("Update gallery error:", error);
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

export const applicationForm = async (req, res) => {
  try {
    // Destructuring all fields from the frontend request
    const {
      firstName,
      lastName,
      email,
      phone,
      dob,
      country,
      level,
      course,
      education,
      ielts,
      passport,
      message,
    } = req.body;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_ID,
        pass: process.env.GMAIL_PASS, // Use 16-character App Password
      },
    });

    const htmlContent = `
        <div
      style="
        font-family: &quot;Segoe UI&quot;, Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        color: #333;
        margin: 0;
        padding: 0;
        background-color: #f4f4f4;
        padding-top: 20px;
        padding-bottom: 20px;
      "
    >
      <div
        style="
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #dddddd;
        "
      >
        <div
          style="
            background-color: #801a1a;
            color: #ffffff;
            padding: 25px;
            text-align: center;
          "
        >
          <h2
            style="
              margin: 0;
              font-size: 20px;
              text-transform: uppercase;
              letter-spacing: 1px;
            "
          >
            New Student Application
          </h2>
        </div>

        <div style="padding: 30px">
          <p style="margin-top: 0; font-size: 15px">
            A new lead has been captured from the website application form. See
            details below:
          </p>

          <div
            style="
              font-size: 13px;
              font-weight: bold;
              color: #801a1a;
              text-transform: uppercase;
              border-bottom: 2px solid #f2f2f2;
              padding-bottom: 5px;
              margin-bottom: 15px;
              margin-top: 25px;
            "
          >
            Personal Information
          </div>
          <table style="width: 100%; border-collapse: collapse">
            <tr>
              <td
                style="
                  padding: 6px 0;
                  font-weight: 600;
                  color: #666666;
                  width: 160px;
                  font-size: 13px;
                "
              >
                Full Name:
              </td>
              <td style="padding: 6px 0; color: #000000; font-size: 14px">
                ${firstName} ${lastName}
              </td>
            </tr>
            <tr>
              <td
                style="
                  padding: 6px 0;
                  font-weight: 600;
                  color: #666666;
                  font-size: 13px;
                "
              >
                Email Address:
              </td>
              <td style="padding: 6px 0; color: #000000; font-size: 14px">
                <a
                  href="mailto:${email}"
                  style="color: #801a1a; text-decoration: none"
                  >${email}</a
                >
              </td>
            </tr>
            <tr>
              <td
                style="
                  padding: 6px 0;
                  font-weight: 600;
                  color: #666666;
                  font-size: 13px;
                "
              >
                Phone Number:
              </td>
              <td style="padding: 6px 0; color: #000000; font-size: 14px">
                ${phone}
              </td>
            </tr>
            <tr>
              <td
                style="
                  padding: 6px 0;
                  font-weight: 600;
                  color: #666666;
                  font-size: 13px;
                "
              >
                Date of Birth:
              </td>
              <td style="padding: 6px 0; color: #000000; font-size: 14px">
                ${dob}
              </td>
            </tr>
          </table>

          <div
            style="
              font-size: 13px;
              font-weight: bold;
              color: #801a1a;
              text-transform: uppercase;
              border-bottom: 2px solid #f2f2f2;
              padding-bottom: 5px;
              margin-bottom: 15px;
              margin-top: 25px;
            "
          >
            Study Preferences
          </div>
          <table style="width: 100%; border-collapse: collapse">
            <tr>
              <td
                style="
                  padding: 6px 0;
                  font-weight: 600;
                  color: #666666;
                  width: 160px;
                  font-size: 13px;
                "
              >
                Preferred Country:
              </td>
              <td style="padding: 6px 0; color: #000000; font-size: 14px">
                ${country}
              </td>
            </tr>
            <tr>
              <td
                style="
                  padding: 6px 0;
                  font-weight: 600;
                  color: #666666;
                  font-size: 13px;
                "
              >
                Level of Study:
              </td>
              <td style="padding: 6px 0; color: #000000; font-size: 14px">
                ${level}
              </td>
            </tr>
            <tr>
              <td
                style="
                  padding: 6px 0;
                  font-weight: 600;
                  color: #666666;
                  font-size: 13px;
                "
              >
                Program of Interest:
              </td>
              <td style="padding: 6px 0; color: #000000; font-size: 14px">
                ${course}
              </td>
            </tr>
          </table>

          <div
            style="
              font-size: 13px;
              font-weight: bold;
              color: #801a1a;
              text-transform: uppercase;
              border-bottom: 2px solid #f2f2f2;
              padding-bottom: 5px;
              margin-bottom: 15px;
              margin-top: 25px;
            "
          >
            Academic & Visa Status
          </div>
          <table style="width: 100%; border-collapse: collapse">
            <tr>
              <td
                style="
                  padding: 6px 0;
                  font-weight: 600;
                  color: #666666;
                  width: 160px;
                  font-size: 13px;
                "
              >
                Highest Education:
              </td>
              <td style="padding: 6px 0; color: #000000; font-size: 14px">
                ${education}
              </td>
            </tr>
            <tr>
              <td
                style="
                  padding: 6px 0;
                  font-weight: 600;
                  color: #666666;
                  font-size: 13px;
                "
              >
                IELTS Score:
              </td>
              <td style="padding: 6px 0; color: #000000; font-size: 14px">
                ${ielts}
              </td>
            </tr>
            <tr>
              <td
                style="
                  padding: 6px 0;
                  font-weight: 600;
                  color: #666666;
                  font-size: 13px;
                "
              >
                Passport Status:
              </td>
              <td style="padding: 6px 0; color: #000000; font-size: 14px">
                ${passport}
              </td>
            </tr>
          </table>

          <div
            style="
              font-size: 13px;
              font-weight: bold;
              color: #801a1a;
              text-transform: uppercase;
              border-bottom: 2px solid #f2f2f2;
              padding-bottom: 5px;
              margin-bottom: 15px;
              margin-top: 25px;
            "
          >
            Additional Message
          </div>
          <div
            style="
              background-color: #f9f9f9;
              border-left: 4px solid #801a1a;
              padding: 15px;
              margin-top: 10px;
              font-style: italic;
              font-size: 14px;
              color: #444;
            "
          >
            ${message || "No additional message provided."}
          </div>
        </div>

        <div
          style="
            background-color: #f4f4f4;
            color: #888888;
            text-align: center;
            padding: 20px;
            font-size: 12px;
            border-top: 1px solid #eeeeee;
          "
        >
          This is an automated notification from the
          <strong>Visa Express</strong> Portal.<br />
          Please process this lead within 24 hours.
        </div>
      </div>
    </div>
    `;

    const mailOptions = {
      from: `"New Application of ${firstName}" <${process.env.GMAIL_ID}>`,
      to: APPLICATION_EMAIL,
      subject: `New Application: ${firstName}`,
      html: htmlContent,
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

export const counsellingForm = async (req, res) => {
  try {
    // Destructuring all fields from the frontend request
    const { name, email, phone, country } = req.body;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_ID,
        pass: process.env.GMAIL_PASS, // Use 16-character App Password
      },
    });

    const htmlContent = `
    <div
      style="
        margin: 0;
        padding: 0;
        background-color: #f8f9fa;
        font-family: &quot;Helvetica Neue&quot;, Helvetica, Arial, sans-serif;
      "
    >
      <table
        align="center"
        border="0"
        cellpadding="0"
        cellspacing="0"
        width="100%"
        style="
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
          border: 1px solid #e1e1e1;
        "
      >
        <tr>
          <td
            style="
              background: linear-gradient(to right, #801a1a, #d44d26);
              height: 6px;
            "
          ></td>
        </tr>

        <tr>
          <td style="padding: 40px 30px 20px 30px; text-align: center">
            <div
              style="
                display: inline-block;
                padding: 5px 15px;
                background-color: #fff0f0;
                color: #801a1a;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 15px;
              "
            >
              New Inquiry
            </div>
            <h1
              style="
                margin: 0;
                color: #1a1a1a;
                font-size: 24px;
                font-weight: 800;
              "
            >
              Counseling Request
            </h1>
            <p style="margin: 10px 0 0 0; color: #666; font-size: 14px">
              A student is waiting for a free session review.
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding: 0 30px 30px 30px">
            <table
              width="100%"
              border="0"
              cellpadding="0"
              cellspacing="0"
              style="
                background-color: #ffffff;
                border: 1px solid #f0f0f0;
                border-radius: 8px;
              "
            >
              <tr>
                <td style="padding: 20px; border-bottom: 1px solid #f8f8f8">
                  <span
                    style="
                      display: block;
                      color: #999;
                      font-size: 11px;
                      text-transform: uppercase;
                      font-weight: bold;
                      margin-bottom: 4px;
                    "
                    >Student Name</span
                  >
                  <span
                    style="font-size: 16px; color: #1a1a1a; font-weight: 600"
                    >${name}</span
                  >
                </td>
              </tr>

              <tr>
                <td style="padding: 0">
                  <table
                    width="100%"
                    border="0"
                    cellpadding="0"
                    cellspacing="0"
                  >
                    <tr>
                      <td
                        width="50%"
                        style="
                          padding: 20px;
                          border-right: 1px solid #f8f8f8;
                          border-bottom: 1px solid #f8f8f8;
                        "
                      >
                        <span
                          style="
                            display: block;
                            color: #999;
                            font-size: 11px;
                            text-transform: uppercase;
                            font-weight: bold;
                            margin-bottom: 4px;
                          "
                          >Email Address</span
                        >
                        <a
                          href="mailto:${email}"
                          style="
                            font-size: 14px;
                            color: #801a1a;
                            text-decoration: none;
                            font-weight: 500;
                          "
                          >${email}</a
                        >
                      </td>
                      <td
                        width="50%"
                        style="padding: 20px; border-bottom: 1px solid #f8f8f8"
                      >
                        <span
                          style="
                            display: block;
                            color: #999;
                            font-size: 11px;
                            text-transform: uppercase;
                            font-weight: bold;
                            margin-bottom: 4px;
                          "
                          >Phone Number</span
                        >
                        <span
                          style="
                            font-size: 14px;
                            color: #1a1a1a;
                            font-weight: 500;
                          "
                          >${phone}</span
                        >
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td
                  style="
                    padding: 20px;
                    background-color: #fcfcfc;
                    border-bottom-left-radius: 8px;
                    border-bottom-right-radius: 8px;
                  "
                >
                  <table
                    width="100%"
                    border="0"
                    cellpadding="0"
                    cellspacing="0"
                  >
                    <tr>
                      <td style="width: 40px">
                        <div
                          style="
                            background-color: #801a1a;
                            color: #ffffff;
                            width: 30px;
                            height: 30px;
                            line-height: 30px;
                            border-radius: 6px;
                            text-align: center;
                            font-size: 18px;
                          "
                        >
                          ✈
                        </div>
                      </td>
                      <td>
                        <span
                          style="
                            display: block;
                            color: #999;
                            font-size: 11px;
                            text-transform: uppercase;
                            font-weight: bold;
                          "
                          >Country of Interest</span
                        >
                        <span
                          style="
                            font-size: 15px;
                            color: #1a1a1a;
                            font-weight: bold;
                          "
                          >${country}</span
                        >
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding: 0 30px 40px 30px; text-align: center">
            <a
              href="tel:${phone}"
              style="
                display: inline-block;
                padding: 14px 30px;
                background-color: #801a1a;
                color: #ffffff;
                text-decoration: none;
                border-radius: 6px;
                font-weight: bold;
                font-size: 14px;
                box-shadow: 0 4px 6px rgba(128, 26, 26, 0.2);
              "
            >
              Call Student Now
            </a>
          </td>
        </tr>

        <tr>
          <td
            style="
              padding: 20px;
              background-color: #1a1a1a;
              color: #ffffff;
              text-align: center;
              border-bottom-left-radius: 12px;
              border-bottom-right-radius: 12px;
            "
          >
            <p style="margin: 0; font-size: 12px; opacity: 0.8">
              Visa Express Support Dashboard
            </p>
            <p
              style="
                margin: 5px 0 0 0;
                font-size: 10px;
                opacity: 0.5;
                text-transform: uppercase;
                letter-spacing: 1px;
              "
            >
              Internal Use Only • Respond within 24h
            </p>
          </td>
        </tr>
      </table>
    </div>
    `;

    const mailOptions = {
      from: `"New Counselling Request from ${name}" <${process.env.GMAIL_ID}>`,
      to: COUNSELLING_EMAIL,
      subject: `New Counselling Request: ${name}`,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    res
      .status(200)
      .json({ success: true, message: "Counselling request submitted!" });
  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
