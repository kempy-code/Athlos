// =====================================
// ATHLOS LOADING RENDERER
// public/js/renders/loading.js
// =====================================


export function renderLoading(

    container

){



    if(!container){

        return;

    }






    container.innerHTML = `

        <div class="loading-wrapper">


            <div class="athlos-loader">


                <div class="loader-ring"></div>


                <div class="loader-core">

                    A

                </div>


            </div>



            <h2>
                Creating your Athlos plan
            </h2>



            <p class="loading-text">
                Analysing your athlete profile...
            </p>



            <div class="loading-steps">


                <div class="loading-step active">

                    ✓ Reading goals

                </div>



                <div class="loading-step">

                    Building training structure

                </div>



                <div class="loading-step">

                    Optimising recovery

                </div>



                <div class="loading-step">

                    Generating program

                </div>



            </div>


        </div>

    `;






    animateSteps();


}







// =====================================
// LOADING ANIMATION
// =====================================


function animateSteps(){



    const steps =
        document.querySelectorAll(
            ".loading-step"
        );



    let index = 0;





    const interval =
        setInterval(()=>{



            steps.forEach(step=>{


                step.classList.remove(
                    "active"
                );


            });





            if(
                steps[index]
            ){

                steps[index]
                .classList.add(
                    "active"
                );

            }





            index++;





            if(
                index >= steps.length
            ){

                index = 0;

            }



        },1200);




}