// =====================================
// ATHLOS TRAINING CALENDAR
// public/js/results/calendar.js
// =====================================


export function renderCalendar(

    container,

    workouts = [],
    onMove = () => {}

){


    if(!container){

        return;

    }



    const days = [

        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"

    ];







    container.innerHTML = `


    <section class="dashboard-section">


        <div class="section-header">


            <h2>

                Training Calendar

            </h2>


            <p>

                Your weekly training schedule

            </p>


        </div>







        <div class="calendar-wrapper">


            <div class="calendar-grid">


            ${
                days.map(day => {


                    const workout =
                        findWorkout(
                            day,
                            workouts
                        );



                    return `


                    <button

                        class="calendar-card ${
                            workout
                            ?
                            "training-day"
                            :
                            "rest-day"

                        }"

                        data-day="${escapeHtml(day)}"
                        draggable="${workout ? "true" : "false"}"


                    >


                        <span class="calendar-day">

                            ${day.substring(0,3)}

                        </span>





                        ${
                            workout

                            ?

                            `

                            <h3>

                                ${escapeHtml(workout.name || "Training Session")}

                            </h3>


                            <span class="calendar-type">

                                ${escapeHtml(workout.type || "Training")}

                            </span>


                            <span class="calendar-duration">

                                ${escapeHtml(workout.duration || "")}

                            </span>

                            `


                            :


                            `

                            <h3>

                                Rest

                            </h3>


                            <span class="calendar-type">

                                Recovery

                            </span>

                            `

                        }



                    </button>


                    `;


                }).join("")

            }


            </div>







            <div

            id="calendar-details"

            class="calendar-details">


                <h3>

                    Select a workout

                </h3>


                <p>

                    Click a training day to view details.

                </p>


            </div>





        </div>





    </section>


    `;






    addCalendarEvents(

        container,

        workouts,
        onMove

    );





}









// =====================================
// FIND WORKOUT
// =====================================


function findWorkout(

    day,

    workouts,
    onMove

){


    return workouts.find(workout => {


        if(!workout.day){

            return false;

        }



        return (

            normaliseDay(workout.day) === normaliseDay(day)

        );


    });


}









// =====================================
// EVENTS
// =====================================


function addCalendarEvents(

    container,

    workouts

){



    const cards =
        container.querySelectorAll(
            ".calendar-card"
        );



    const details =
        container.querySelector(
            "#calendar-details"
        );






    cards.forEach(card => {
        card.addEventListener("dragstart", event => {
            const workout = findWorkout(card.dataset.day, workouts);
            if (!workout) { event.preventDefault(); return; }
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", card.dataset.day);
            card.classList.add("dragging");
        });
        card.addEventListener("dragend", () => card.classList.remove("dragging"));
        card.addEventListener("dragover", event => { event.preventDefault(); card.classList.add("drag-target"); });
        card.addEventListener("dragleave", () => card.classList.remove("drag-target"));
        card.addEventListener("drop", event => {
            event.preventDefault();
            card.classList.remove("drag-target");
            const sourceDay = event.dataTransfer.getData("text/plain");
            const targetDay = card.dataset.day;
            if (!sourceDay || sourceDay === targetDay) return;
            const source = findWorkout(sourceDay, workouts);
            const target = findWorkout(targetDay, workouts);
            const moved = workouts.map(workout => {
                if (workout === source) return { ...workout, day: targetDay };
                if (workout === target) return { ...workout, day: sourceDay };
                return workout;
            });
            onMove(moved);
        });


        card.addEventListener(

            "click",

            ()=>{


                const day =
                    card.dataset.day;



                const workout =
                    findWorkout(
                        day,
                        workouts
                    );





                if(!workout){


                    details.innerHTML = `


                    <h3>

                        ${escapeHtml(day)}

                        Rest Day

                    </h3>



                    <p>

                        Focus on recovery, mobility and preparation.

                    </p>


                    `;


                    return;

                }







                details.innerHTML = `



                <div class="calendar-detail-header">


                    <span>

                        ${escapeHtml(day)}

                    </span>


                    <h2>

                        ${escapeHtml(workout.name || "Training Session")}

                    </h2>


                </div>






                <div class="calendar-detail-info">


                    <p>

                        <strong>
                        Type:
                        </strong>

                        ${escapeHtml(workout.type || "-")}

                    </p>




                    <p>

                        <strong>
                        Duration:
                        </strong>

                        ${escapeHtml(workout.duration || "-")}

                    </p>




                    <p>

                        <strong>
                        Focus:
                        </strong>

                        ${escapeHtml(workout.purpose || "-")}

                    </p>


                </div>







                <h3>

                    Exercises

                </h3>




                <ul>


                ${
                    workout.exercises

                    ?

                    workout.exercises.map(ex => {


                        return `


                        <li>

                        ${
                            typeof ex === "string"

                            ?

                            escapeHtml(ex)

                            :

                            escapeHtml(ex?.name || ex?.exercise || "Exercise")

                        }


                        </li>


                        `;


                    }).join("")


                    :

                    "<li>No exercises available</li>"

                }


                </ul>


                `;



            }


        );


    });


}

function normaliseDay(value) {
    const text = String(value || "").toLowerCase();
    return ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        .find(day => text.includes(day)) || text;
}

function escapeHtml(value) {
    return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
