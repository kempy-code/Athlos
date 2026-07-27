// =====================================
// ATHLOS RESULTS CONTROLLER
// public/js/results/results.js
// =====================================


// =====================================
// IMPORTS
// =====================================

import {
    renderCalendar
} from "./calendar.js";


import {
    renderCharts
} from "./charts.js";


import {
    renderWorkouts
} from "./workouts.js";


import {
    renderNutrition
} from "./nutrition.js";


import {
    renderRecovery
} from "./recovery.js";


import {
    renderExercises
} from "./exercises.js";


import {
    renderAchievements
} from "./achievements.js";




// =====================================
// LOAD DASHBOARD
// =====================================

export function loadDashboard(plan){


    if(!plan){

        console.error(
            "No Athlos plan received"
        );

        return;

    }



    console.log(
        "Athlos dashboard loaded:",
        plan
    );



    renderHeader(plan);


    renderCalendarSection(plan);


    renderWorkoutSection(plan);


    renderAnalyticsSection(plan);


    renderNutritionSection(plan);


    renderRecoverySection(plan);


    renderExerciseSection(plan);


    renderAchievementSection(plan);


}






// =====================================
// HEADER
// =====================================


function renderHeader(plan){


    const container =
        document.getElementById(
            "summary"
        );


    if(!container){

        return;

    }



    container.innerHTML = `


        <div class="athlos-profile-summary">


            <div class="profile-title">


                <h2>

                    ${
                        plan.program_name ||
                        "Athlos Training Plan"
                    }

                </h2>


                <p>

                    AI personalised athlete program

                </p>


            </div>





            <div class="profile-stats">


                ${createStat(
                    "Duration",
                    plan.program_duration
                )}



                ${createStat(
                    "Training Days",
                    plan.training_days
                )}



                ${createStat(
                    "Session Length",
                    plan.session_length
                )}



                ${createStat(
                    "Available Days",
                    plan.available_days?.join(", ")
                )}


            </div>


        </div>


    `;


}






function createStat(label,value){


    return `

        <div class="profile-stat">

            <span>
                ${label}
            </span>


            <strong>
                ${value || "-"}
            </strong>


        </div>

    `;

}






// =====================================
// CALENDAR
// =====================================


function renderCalendarSection(plan){


    const container =
        document.getElementById(
            "calendar"
        );


    if(!container){

        return;

    }



    renderCalendar(

        container,

        plan.workouts || []

    );


}






// =====================================
// WORKOUTS
// =====================================


function renderWorkoutSection(plan){


    const container =
        document.getElementById(
            "workouts"
        );


    if(!container){

        return;

    }



    renderWorkouts(

        container,

        plan.workouts || []

    );


}






// =====================================
// ANALYTICS
// =====================================


function renderAnalyticsSection(plan){


    const container =
        document.getElementById(
            "analytics"
        );


    if(!container){

        return;

    }



    renderCharts(

        container,

        plan.progression || {}

    );


}






// =====================================
// NUTRITION
// =====================================


function renderNutritionSection(plan){


    const container =
        document.getElementById(
            "nutrition"
        );


    if(!container){

        return;

    }



    renderNutrition(

        container,

        plan.nutrition || {}

    );


}






// =====================================
// RECOVERY
// =====================================


function renderRecoverySection(plan){


    const container =
        document.getElementById(
            "recovery"
        );


    if(!container){

        return;

    }



    renderRecovery(

        container,

        plan.recovery || {}

    );


}






// =====================================
// EXERCISES
// =====================================


function renderExerciseSection(plan){


    const container =
        document.getElementById(
            "exercises"
        );


    if(!container){

        return;

    }



    const exercises = [];


    if(plan.workouts){

        plan.workouts.forEach(workout=>{


            if(workout.exercises){

                exercises.push(
                    ...workout.exercises
                );

            }


        });

    }



    renderExercises(

        container,

        exercises

    );


}






// =====================================
// ACHIEVEMENTS
// =====================================


function renderAchievementSection(plan){


    const container =
        document.getElementById(
            "achievements"
        );


    if(!container){

        return;

    }



    renderAchievements(

        container,

        plan.achievements || [],

        plan.progression?.milestones || []

    );


}