// ============================================================
// AGRIMIND AI
// FRONTEND APPLICATION
// ============================================================


const navItems =
    document.querySelectorAll(".nav-item");


const pageSections =
    document.querySelectorAll(".page-section");


const dashboard =
    document.getElementById("dashboard");


// ============================================================
// NAVIGATION
// ============================================================

navItems.forEach(item => {

    item.addEventListener("click", event => {

        event.preventDefault();

        const target =
            item.getAttribute("href");


        navItems.forEach(nav => {

            nav.classList.remove("active");

        });


        item.classList.add("active");


        pageSections.forEach(section => {

            section.classList.add("hidden");

        });


        if (target === "#dashboard") {

            dashboard.classList.remove("hidden");

        } else {

            const section =
                document.querySelector(target);

            if (section) {

                section.classList.remove("hidden");

            }

        }

    });

});


// ============================================================
// OPEN DETECTION
// ============================================================

function openDetection() {

    navItems.forEach(nav => {

        nav.classList.remove("active");

    });


    const detectionNav =
        document.querySelector(
            'a[href="#detection"]'
        );


    if (detectionNav) {

        detectionNav.classList.add("active");

    }


    dashboard.classList.add("hidden");


    pageSections.forEach(section => {

        section.classList.add("hidden");

    });


    document
        .getElementById("detection")
        .classList.remove("hidden");

}


// ============================================================
// IMAGE UPLOAD
// ============================================================

const imageInput =
    document.getElementById("imageInput");


const imagePreview =
    document.getElementById("imagePreview");


const analyzeButton =
    document.getElementById("analyzeButton");


if (imageInput) {

    imageInput.addEventListener(
        "change",
        function () {

            const file =
                this.files[0];


            if (!file) {

                return;

            }


            if (!file.type.startsWith("image/")) {

                alert(
                    "Please select a valid image."
                );

                return;

            }


            const reader =
                new FileReader();


            reader.onload = function (event) {

                imagePreview.innerHTML = `
                    <img
                        src="${event.target.result}"
                        alt="Selected crop leaf">
                `;

            };


            reader.readAsDataURL(file);


            analyzeButton.disabled = false;

        }
    );

}


// ============================================================
// AI ANALYSIS PLACEHOLDER
// ============================================================

function analyzeImage() {

    const resultCard =
        document.getElementById(
            "resultCard"
        );


    const resultContent =
        document.getElementById(
            "resultContent"
        );


    resultCard.classList.remove("hidden");


    resultContent.innerHTML = `
        <div>
            <h3>⏳ AI Analysis</h3>

            <p>
                Model integration will be
                connected after the trained
                EfficientNet model is ready.
            </p>
        </div>
    `;

}


// ============================================================
// INITIAL STATE
// ============================================================

console.log(
    "🌱 AgriMind AI frontend loaded successfully."
);