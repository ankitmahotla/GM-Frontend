const clientName = "xxxxx";
const amount = "xxxxx";
const purpose = "Numerology Report ";
const redirectUrl = "xxxxx";
const formSubmissionWebhook =
  "xxxxxx";
const paymentDetailsWebhook =
  "xxxxxx";
const apiKey = "xxxxxxxx";
const userImage = "https://s3.amazonaws.com/rzp-mobile/images/rzp.jpg";

const form = document.getElementById("details");
const paymentButton = document.getElementById("payment");
const baseUrl = "https://growthifymedia-services.onrender.com";
let data;

document.getElementsByClassName("amount")[0].innerText = `₹${amount}.00`;

document.getElementsByClassName("total-amount")[0].innerText = `₹${amount}.00`;

paymentButton.innerText = `Pay ₹${amount}`;

let rzpCompatibleAmount = Number(amount) * 100;
rzpCompatibleAmount = rzpCompatibleAmount.toString();

let options = {
  key: apiKey,
  amount: rzpCompatibleAmount,
  currency: "INR",
  description: purpose,
  image: userImage,
  prefill: {
    email: "test@gmail.com",
    contact: "9812791045",
  },
  config: {
    display: {
      blocks: {
        banks: {
          name: "Most Used Methods",
          instruments: [
            {
              method: "wallet",
              wallets: ["phonepe"],
            },
            {
              method: "upi",
            },
          ],
        },
      },
      sequence: ["block.banks"],
      preferences: {
        show_default_blocks: true,
      },
    },
  },
  handler: async function (response) {
    const paymentId = response.razorpay_payment_id;
    const orderId = response.razorpay_order_id;
    const signature = response.razorpay_signature;
    form.style.display = "none";
    document.getElementById("loader-container").style.display = "flex";

    const verification = await fetch(
      `${baseUrl}/api/payments/new/razorpay/verify/${clientName}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          razorpay_payment_id: paymentId,
          razorpay_order_id: orderId,
          razorpay_signature: signature,
        }),
      }
    );

    const verificationData = await verification.json();
    console.log(verificationData);
    paymentButton.disabled = false;
    paymentButton.style.opacity = 1;
    paymentButton.innerText = `Pay ₹${amount}`;
    window.location.href = redirectUrl;
  },

  modal: {
    ondismiss: function () {
      paymentButton.disabled = false;
      paymentButton.style.opacity = 1;
      paymentButton.innerText = `Pay ₹${amount}`;
    },
  },
};

const getInput = (name) => {
  return document.getElementById(name);
};

const setBorder = (input, value) => {
  input.style.border = value;
};

const isValidName = (name) => {
  // Check if the name is not empty
  if (!name.trim()) {
    return false;
  }

  // Check if the name contains only letters (no numbers or special characters)
  const nameRegex = /^[a-zA-Z\s]+$/;
  return nameRegex.test(name.trim());
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhone = (phone) => {
  const phoneRegex = /^[5-9][0-9]{9}$/;
  const sequentialPattern = /(.)\1{9}/; // Check for 10 repeated digits
  const sequentialMatch = phone.match(sequentialPattern);
  return phoneRegex.test(phone) && !sequentialMatch;
};

paymentButton.addEventListener("click", async (e) => {
  e.preventDefault();

  const formData = {
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    phone: form.phone.value.trim(),
    gender: form.gender.value,
    birthday: form.birthday.value,
    language: form.language.value,
  };

  let isValid = true;

  if (!isValidName(formData.name)) {
    const nameError = getInput("nameError");
    nameError.style.display = "flex";
    const input = getInput("name");
    input.oninput = function () {
      nameError.style.display = "none";
      setBorder(input, "");
    };
    setBorder(input, "1px solid red");
    isValid = false;
  }

  if (!isValidEmail(formData.email)) {
    const emailError = getInput("emailError");
    emailError.style.display = "flex";
    const input = getInput("email");
    input.oninput = function () {
      emailError.style.display = "none";
      setBorder(input, "");
    };
    setBorder(input, "1px solid red");
    isValid = false;
  }

  if (!isValidPhone(formData.phone)) {
    const phoneError = getInput("phoneError");
    phoneError.style.display = "flex";
    const input = getInput("phone");
    input.oninput = function () {
      phoneError.style.display = "none";
      setBorder(input, "");
    };
    setBorder(input, "1px solid red");
    isValid = false;
  }

  if (isValid) {
    paymentButton.disabled = true;
    paymentButton.style.opacity = 0.7;
    paymentButton.innerText = "Submitting...";
    const urlParams = new URLSearchParams(window.location.search);
    data = {
      name: formData.name,
      amount: rzpCompatibleAmount,
      email: formData.email,
      phone: formData.phone,
      purpose,
      redirectUrl,
      utm_source: urlParams.get("utm_source"),
      utm_medium: urlParams.get("utm_medium"),
      utm_campaign: urlParams.get("utm_campaign"),
      utm_adgroup: formData.language,
      utm_content: formData.gender,
      utm_term: formData.birthday,
      utm_id: urlParams.get("utm_id"),
      adsetname: urlParams.get("adset name"),
      adname: urlParams.get("ad name"),
      landingPageUrl: window.location.href.split("?")[0],
    };

    const updatedData = {
      formData: data,
      userWebhook: formSubmissionWebhook,
      paymentWebhook: paymentDetailsWebhook,
    };

    try {
      const response = await fetch(
        `${baseUrl}/api/payments/new/razorpay/createOrder/${clientName}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        }
      );

      const result = await response.json();
      if (result && result.order && result.order.id) {
        options.prefill = {
          email: form.email.value.trim(),
          contact: form.phone.value.trim(),
        };
        options.order_id = result.order.id;
        const rzp1 = new Razorpay(options);
        rzp1.open();
      } else {
        alert("Error: Unable to retrieve order ID. Please try again later.");
      }
    } catch (error) {
      alert("Some error occured! Please retry");
      console.log(error);
    } finally {
      paymentButton.disabled = false;
      paymentButton.style.opacity = 1;
      paymentButton.innerText = `Pay ₹${amount}`;
    }
  }
});