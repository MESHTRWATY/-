"use strict";

/* =====================================
   مشترواتي
   إدارة نموذج الطلب
===================================== */


/* عناصر النموذج */

const orderForm = document.getElementById("orderForm");

const customerName = document.getElementById("customerName");

const phone = document.getElementById("phone");

const projectName = document.getElementById("projectName");

const buildingNumber = document.getElementById("buildingNumber");

const orderDetails = document.getElementById("orderDetails");

const message = document.getElementById("message");

const submitButton = document.getElementById("submitButton");


/* مفاتيح التخزين */

const STORAGE_KEY = "moshtrawaty_orders";

const DRAFT_KEY = "moshtrawaty_draft";


/* =====================================
   تشغيل التطبيق
===================================== */

if (
    orderForm &&
    customerName &&
    phone &&
    projectName &&
    buildingNumber &&
    orderDetails &&
    message &&
    submitButton
) {

    initializeApp();

} else {

    console.error(
        "تعذر تشغيل التطبيق. راجع عناصر HTML وأسماء الحقول."
    );

}


/* =====================================
   تهيئة التطبيق
===================================== */

function initializeApp() {

    orderForm.addEventListener(
        "submit",
        handleOrderSubmit
    );

    restoreDraft();

    [
        customerName,
        phone,
        projectName,
        buildingNumber,
        orderDetails
    ].forEach(function (field) {

        field.addEventListener(
            "input",
            saveDraft
        );

    });

}


/* =====================================
   التعامل مع إرسال الطلب
===================================== */

function handleOrderSubmit(event) {

    event.preventDefault();

    const name = customerName.value.trim();

    const phoneNumber = phone.value.trim();

    const project = projectName.value.trim();

    const building = buildingNumber.value.trim();

    const details = orderDetails.value.trim();


    /* التأكد من اكتمال البيانات */

    if (
        !name ||
        !phoneNumber ||
        !project ||
        !building ||
        !details
    ) {

        showMessage(
            "من فضلك املأ جميع البيانات المطلوبة.",
            "error"
        );

        return;

    }


    /* التحقق من رقم التليفون */

    const normalizedPhone = phoneNumber.replace(
        /[\s()-]/g,
        ""
    );

    const egyptianPhonePattern =
        /^(?:(?:\+20|0020)1[0125]\d{8}|01[0125]\d{8})$/;

    if (!egyptianPhonePattern.test(normalizedPhone)) {

        showMessage(
            "من فضلك اكتب رقم تليفون مصري صحيح.",
            "error"
        );

        phone.focus();

        return;

    }


    /* إنشاء الطلب */

    const newOrder = {

        id: createOrderId(),

        customerName: name,

        phone: phoneNumber,

        projectName: project,

        buildingNumber: building,

        orderDetails: details,

        createdAt: new Date().toISOString(),

        status: "جديد"

    };


    /* حفظ الطلب */

    const saved = saveOrder(newOrder);


    if (!saved) {

        showMessage(
            "تعذر حفظ الطلب على هذا الجهاز. حاول مرة أخرى.",
            "error"
        );

        return;

    }


    /* رسالة النجاح */

    showMessage(
        "تم تسجيل الطلب على هذا الجهاز بنجاح.",
        "success"
    );


    /* إظهار بيانات الطلب في وحدة التحكم */

    console.log(
        "تم تسجيل طلب جديد:",
        newOrder
    );


    /* تنظيف النموذج */

    orderForm.reset();

    clearDraft();

}


/* =====================================
   إنشاء رقم الطلب
===================================== */

function createOrderId() {

    return (
        "MSH-" +
        Date.now().toString(36).toUpperCase() +
        "-" +
        Math.random().toString(36).slice(2, 7).toUpperCase()
    );

}


/* =====================================
   حفظ الطلبات محليًا
===================================== */

function saveOrder(order) {

    try {

        const orders = getOrders();

        orders.push(order);

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(orders)
        );

        return true;

    } catch (error) {

        console.error(
            "حدث خطأ أثناء حفظ الطلب:",
            error
        );

        return false;

    }

}


/* =====================================
   قراءة الطلبات المحفوظة
===================================== */

function getOrders() {

    try {

        const storedOrders = localStorage.getItem(
            STORAGE_KEY
        );

        if (!storedOrders) {

            return [];

        }

        const orders = JSON.parse(storedOrders);

        return Array.isArray(orders)
            ? orders
            : [];

    } catch (error) {

        console.error(
            "تعذر قراءة الطلبات:",
            error
        );

        return [];

    }

}


/* =====================================
   عرض الرسائل
===================================== */

function showMessage(text, type) {

    message.textContent = text;

    message.className = "message " + type;

}


/* =====================================
   حفظ المسودة أثناء الكتابة
===================================== */

function saveDraft() {

    const draft = {

        customerName: customerName.value,

        phone: phone.value,

        projectName: projectName.value,

        buildingNumber: buildingNumber.value,

        orderDetails: orderDetails.value

    };


    try {

        localStorage.setItem(
            DRAFT_KEY,
            JSON.stringify(draft)
        );

    } catch (error) {

        console.error(
            "تعذر حفظ المسودة:",
            error
        );

    }

}


/* =====================================
   استعادة المسودة
===================================== */

function restoreDraft() {

    try {

        const storedDraft = localStorage.getItem(
            DRAFT_KEY
        );

        if (!storedDraft) {

            return;

        }

        const draft = JSON.parse(storedDraft);


        customerName.value =
            draft.customerName || "";

        phone.value =
            draft.phone || "";

        projectName.value =
            draft.projectName || "";

        buildingNumber.value =
            draft.buildingNumber || "";

        orderDetails.value =
            draft.orderDetails || "";


    } catch (error) {

        console.error(
            "تعذر استعادة المسودة:",
            error
        );

    }

}


/* =====================================
   مسح المسودة بعد إرسال الطلب
===================================== */

function clearDraft() {

    try {

        localStorage.removeItem(DRAFT_KEY);

    } catch (error) {

        console.error(
            "تعذر مسح المسودة:",
            error
        );

    }

}