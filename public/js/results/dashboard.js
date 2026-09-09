// =====================================
// ATHLOS DASHBOARD SHELL
// public/js/results/dashboard.js
// =====================================


export function createDashboard(plan) {


    const dashboard =
        document.createElement("div");


    dashboard.className =
        "athlos-dashboard";



    dashboard.innerHTML = `


    <section class="dashboard-hero">


        <div class="hero-content">


            <span class="hero-label">
                ATHLOS PROGRAM
            </span>


            <h1 class="hero-title">
                ${plan.metadata?.programName ||
                plan.program_name ||
                "Athlos Training Plan"}
            </h1>



            <p class="hero-subtitle">

                ${
                    plan.metadata?.duration ||
                    plan.program_duration ||
                    "-"
                }

                •

                ${
                    plan.metadata?.trainingDays ||
                    plan.training_days ||
                    "-"
                }

                training days

                •

                ${
                    plan.metadata?.sessionLength ||
                    plan.session_length ||
                    "-"
                }

            </p>

            <button id="start-over-btn" class="text-button" type="button">Create a new plan</button>


        </div>





        <div class="next-workout-card">


            <span class="hero-card-label">
                NEXT WORKOUT
            </span>



            <h2 id="next-workout-name">
                Loading...
            </h2>



            <p id="next-workout-day">
                -
            </p>

            <div class="hero-actions">
                <button id="start-next-workout-btn" class="primary-button" type="button">Start next workout</button>
                <button id="download-plan-btn" class="secondary-button" type="button">Print or save PDF</button>
            </div>



        </div>


    </section>






    <section
        id="dashboard-stats"
        class="dashboard-stats">

    </section>








    <div class="dashboard-command-bar">
    <nav class="dashboard-tabs" aria-label="Dashboard sections">


        <button
            class="dashboard-tab active"
            type="button"
            aria-current="page"
            data-tab="home">

            Home

        </button>




        <button
            class="dashboard-tab"
            type="button"
            data-tab="calendar">

            Calendar

        </button>




        <button
            class="dashboard-tab"
            type="button"
            data-tab="workouts">

            Workouts

        </button>




        <button
            class="dashboard-tab"
            type="button"
            data-tab="nutrition">

            Nutrition

        </button>




        <button
            class="dashboard-tab"
            type="button"
            data-tab="progress">

            Progress

        </button>

        <button class="dashboard-tab" type="button" data-tab="activity">Activity</button>
        <button class="dashboard-tab" type="button" data-tab="coach">AI Coach</button>
        <button class="dashboard-tab" type="button" data-tab="toolkit">Toolkit</button>
        <button class="dashboard-tab" type="button" data-tab="lab">Athlete Lab</button>
        <button class="dashboard-tab" type="button" data-tab="account">Account</button>



    </nav>
    <button class="dashboard-help-button" id="dashboard-help-btn" type="button" aria-label="Open the Athlos tutorial">Tour</button>
    </div>








    <main class="dashboard-content">


        <section
            id="home-tab"
            class="dashboard-page active">

        </section>




        <section
            id="calendar-tab"
            class="dashboard-page">

        </section>




        <section
            id="workouts-tab"
            class="dashboard-page">

        </section>




        <section
            id="nutrition-tab"
            class="dashboard-page">

        </section>




        <section
            id="progress-tab"
            class="dashboard-page">

        </section>

        <section id="activity-tab" class="dashboard-page"></section>
        <section id="coach-tab" class="dashboard-page"></section>
        <section id="toolkit-tab" class="dashboard-page"></section>
        <section id="lab-tab" class="dashboard-page"></section>
        <section id="account-tab" class="dashboard-page"></section>



    </main>



    `;




    initialiseTabs(
        dashboard
    );


    initialisePDFButton(
        dashboard
    );



    return dashboard;


}









// =====================================
// TAB SYSTEM
// =====================================


function initialiseTabs(dashboard){


    const tabs =
        dashboard.querySelectorAll(
            ".dashboard-tab"
        );



    const pages =
        dashboard.querySelectorAll(
            ".dashboard-page"
        );





    tabs.forEach(tab=>{


        tab.addEventListener(
            "click",
            ()=>{


                tabs.forEach(button=>{

                    button.classList.remove(
                        "active"
                    );
                    button.removeAttribute("aria-current");

                });



                pages.forEach(page=>{

                    page.classList.remove(
                        "active"
                    );

                });




                tab.classList.add(
                    "active"
                );
                tab.setAttribute("aria-current", "page");





                const target =
                    dashboard.querySelector(
                        `#${tab.dataset.tab}-tab`
                    );



                if(target){

                    target.classList.add(
                        "active"
                    );

                }


            }
        );


    });


}









// =====================================
// PDF BUTTON
// =====================================


function initialisePDFButton(dashboard){


    const button =
        dashboard.querySelector(
            "#download-plan-btn"
        );



    if(!button){

        return;

    }





    button.addEventListener(
        "click",
        ()=>{


            window.print();


        }
    );


}
