// =====================================
// ATHLOS CALENDAR RENDERER
// public/js/results/calendar.js
// =====================================


export function renderCalendar(

    container,

    workouts = []

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


    <div class="dashboard-section">


        <div class="section-header">

            <h2>
                Training Calendar
            </h2>

            <p>
                Your weekly training structure
            </p>

        </div>





        <div class="calendar-grid">


            ${
                days.map(day=>{


                    const workout =
                        workouts.find(

                            w =>
                            w.day?.toLowerCase()
                            ===
                            day.toLowerCase()

                        );



                    return `


                    <button

                        class="calendar-day"

                        data-day="${day}"

                    >


                        <span class="calendar-day-name">

                            ${day}

                        </span>



                        <strong>

                            ${
                                workout
                                ?
                                workout.name
                                :
                                "Rest Day"

                            }

                        </strong>



                    </button>


                    `;


                }).join("")
            }



        </div>






        <div

        id="calendar-details"

        class="calendar-details"


        >

            Select a workout

        </div>





    </div>


    `;







    const buttons =
        container.querySelectorAll(
            ".calendar-day"
        );



    const details =
        container.querySelector(
            "#calendar-details"
        );






    buttons.forEach(button=>{



        button.addEventListener(

            "click",

            ()=>{


                const day =
                    button.dataset.day;



                const workout =
                    workouts.find(

                        w =>
                        w.day?.toLowerCase()
                        ===
                        day.toLowerCase()

                    );





                if(!workout){


                    details.innerHTML = `


                    <h3>

                        Rest Day

                    </h3>


                    <p>

                        Recovery, mobility and adaptation.

                    </p>


                    `;


                    return;


                }






                details.innerHTML = `


                    <h3>

                        ${workout.name}

                    </h3>



                    <p>

                        ${workout.type || "Training Session"}

                    </p>




                    <div>

                        <strong>
                        Duration:
                        </strong>

                        ${workout.duration || "-"}

                    </div>





                    <div>

                        <strong>
                        Focus:
                        </strong>

                        ${workout.purpose || "-"}

                    </div>




                    <h4>
                        Exercises
                    </h4>


                    <ul>

                    ${
                        workout.exercises

                        ?

                        workout.exercises
                        .map(ex=>`

                            <li>
                            ${
                                typeof ex === "string"
                                ?
                                ex
                                :
                                ex.name
                            }
                            </li>

                        `)
                        .join("")

                        :

                        "<li>No exercises listed</li>"

                    }


                    </ul>


                `;


            }

        );


    });



}