// =====================================
// ATHLOS SUMMARY COMPONENT
// public/js/renderers/summary.js
// =====================================


export function createSummary({

    profile = {},

    onConfirm,

    onEdit

}) {


    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.className =
        "athlos-summary";



    wrapper.innerHTML = `


        <div class="summary-header">


            <h2>

                Your Athlete Profile

            </h2>


            <p>

                Review your information before creating your program.

            </p>


        </div>



        <div class="summary-grid">

            ${

                Object.entries(profile)

                .map(([key,value])=>{


                    return `

                    <div class="summary-card">


                        <div class="summary-label">

                            ${formatLabel(key)}

                        </div>



                        <div class="summary-value">

                            ${
                                Array.isArray(value)
                                ?
                                value.join(", ")
                                :
                                value || "Not provided"
                            }

                        </div>


                    </div>

                    `;


                })

                .join("")

            }

        </div>




        <div class="summary-actions">


            <button

                class="summary-edit"

                id="summary-edit"

            >

                Edit Answers

            </button>




            <button

                class="summary-confirm"

                id="summary-confirm"

            >

                Generate My Program

            </button>


        </div>


    `;




    const confirmButton =
        wrapper.querySelector(
            "#summary-confirm"
        );


    const editButton =
        wrapper.querySelector(
            "#summary-edit"
        );




    confirmButton.addEventListener(
        "click",
        ()=>{


            if(onConfirm){

                onConfirm(profile);

            }


        }
    );




    editButton.addEventListener(
        "click",
        ()=>{


            if(onEdit){

                onEdit();

            }


        }
    );



    return wrapper;

}








// =====================================
// FORMAT DATABASE KEYS
// =====================================

function formatLabel(text){


    return text

        .replace(
            /([A-Z])/g,
            " $1"
        )

        .replace(
            /^./,
            char =>
            char.toUpperCase()
        );

}