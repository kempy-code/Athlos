// =====================================
// ATHLOS RECOVERY RENDERER
// public/js/results/recovery.js
// =====================================


export function renderRecovery(

    container,

    recovery

){


    if(!container){

        return;

    }



    if(!recovery){

        container.innerHTML = "";

        return;

    }





    container.innerHTML = `


        <div class="dashboard-section">


            <div class="section-header">


                <h2>
                    Recovery
                </h2>


                <p>
                    Optimise adaptation and performance
                </p>


            </div>






            <div class="recovery-grid">


                ${createRecoveryCard(

                    "Sleep",

                    recovery.sleep,

                    "🛌"

                )}



                ${createRecoveryCard(

                    "Mobility",

                    recovery.mobility,

                    "🤸"

                )}




                ${createRecoveryCard(

                    "Rest Days",

                    recovery.rest_days,

                    "🌿"

                )}




                ${createRecoveryCard(

                    "Injury Management",

                    recovery.injury_management,

                    "🩹"

                )}



            </div>








            <div class="recovery-tips">


                <h3>
                    Recovery Checklist
                </h3>



                <div class="tips-list">


                    ${
                        createTips(
                            recovery.recovery_tips
                        )
                    }


                </div>



            </div>





        </div>


    `;


}








// =====================================
// RECOVERY CARD
// =====================================


function createRecoveryCard(

    title,

    value,

    icon

){


    return `


        <div class="recovery-card">


            <div class="recovery-icon">

                ${icon}

            </div>




            <div class="recovery-content">


                <span>

                    ${title}

                </span>



                <p>

                    ${
                        value ||
                        "No information provided."

                    }

                </p>


            </div>


        </div>


    `;


}








// =====================================
// RECOVERY TIPS
// =====================================


function createTips(tips){


    if(

        !Array.isArray(tips) ||

        tips.length === 0

    ){

        return `

            <p>
                No recovery tips provided.
            </p>

        `;

    }





    return tips

        .map(tip=>{


            return `


                <div class="recovery-tip">


                    <span class="tip-check">

                        ✓

                    </span>



                    <p>

                        ${tip}

                    </p>


                </div>


            `;


        })

        .join("");


}