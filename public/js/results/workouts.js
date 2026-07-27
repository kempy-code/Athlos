// =====================================
// ATHLOS WORKOUT RENDERER
// public/js/results/workouts.js
// =====================================


export function renderWorkouts(

    container,

    workouts = []

){


    if(!container){

        return;

    }





    container.innerHTML = `


    <div class="dashboard-section">


        <div class="section-header">


            <h2>
                Workout Library
            </h2>


            <p>
                Detailed sessions from your program
            </p>


        </div>





        <div class="workout-grid">


        ${
            workouts.length

            ?

            workouts.map((workout,index)=>{


                return `


                <article class="workout-card">


                    <h3>

                        ${
                            workout.name ||
                            `Session ${index+1}`

                        }

                    </h3>



                    <span class="workout-type">

                        ${
                            workout.type ||
                            "Training Session"

                        }

                    </span>





                    <div class="workout-info">


                        <p>

                        <strong>
                        Duration:
                        </strong>

                        ${
                            workout.duration ||
                            "-"
                        }

                        </p>



                        <p>

                        <strong>
                        Focus:
                        </strong>

                        ${
                            workout.purpose ||
                            "-"
                        }

                        </p>


                    </div>






                    <div class="workout-section">


                        <h4>
                            Warm Up
                        </h4>


                        <p>

                        ${
                            workout.warmup ||
                            "Dynamic warm up"

                        }

                        </p>


                    </div>







                    <div class="workout-section">


                        <h4>
                            Main Workout
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

                            "<li>No exercises</li>"

                        }


                        </ul>


                    </div>







                    <div class="workout-section">


                        <h4>
                            Cool Down
                        </h4>


                        <p>

                        ${
                            workout.cooldown ||
                            "Recovery mobility"

                        }

                        </p>


                    </div>




                </article>


                `;


            })

            .join("")

            :

            `

            <p>
            No workout data available.
            </p>

            `

        }



        </div>



    </div>


    `;



}