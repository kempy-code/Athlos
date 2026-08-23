// =====================================
// ATHLOS ANALYTICS CHARTS
// public/js/results/charts.js
// =====================================


let volumeChart;
let intensityChart;




export function renderCharts(

    container,

    analytics = {}

){


    if(!container){

        return;

    }



    console.log(
        "Charts loading",
        analytics
    );





    container.innerHTML = `


    <div class="dashboard-section">


        <div class="section-header">

            <h2>
                Training Analytics
            </h2>

            <p>
                Your performance progression
            </p>

        </div>





        <div class="chart-grid">


            <div class="chart-card">

                <h3>
                    Weekly Training Volume
                </h3>


                <canvas id="volume-chart"></canvas>


            </div>






            <div class="chart-card">


                <h3>
                    Training Intensity
                </h3>


                <canvas id="intensity-chart"></canvas>


            </div>


        </div>






        <div class="milestone-chart">


            <h3>
                Progress Milestones
            </h3>


            ${
                renderMilestones(
                    analytics.milestones
                )
            }


        </div>




    </div>


    `;





    createVolumeChart(
        analytics.volume || []
    );


    createIntensityChart(
        analytics.intensity || []
    );



}







// =====================================
// VOLUME GRAPH
// =====================================


function createVolumeChart(data){


    const canvas =
        document.getElementById(
            "volume-chart"
        );



    if(!canvas){

        return;

    }





    if(volumeChart){

        volumeChart.destroy();

    }





    volumeChart =
    new Chart(

        canvas,

        {

            type:"line",


            data:{


                labels:
                    data.map(
                        x=>`Week ${x.week}`
                    ),



                datasets:[{

                    label:
                    "Training Volume",


                    data:
                    data.map(
                        x=>x.value
                    ),


                    tension:0.3

                }]


            },



            options:{


                responsive:true,


                plugins:{


                    legend:{
                        display:true
                    }


                }


            }


        }


    );



}







// =====================================
// INTENSITY GRAPH
// =====================================


function createIntensityChart(data){


    const canvas =
        document.getElementById(
            "intensity-chart"
        );



    if(!canvas){

        return;

    }





    if(intensityChart){

        intensityChart.destroy();

    }





    intensityChart =
    new Chart(

        canvas,

        {

            type:"bar",


            data:{


                labels:

                    data.map(
                        x=>`Week ${x.week}`
                    ),



                datasets:[{


                    label:
                    "Intensity",


                    data:

                    data.map(
                        x=>x.value
                    )


                }]


            },



            options:{


                responsive:true


            }


        }


    );


}








// =====================================
// MILESTONES
// =====================================


function renderMilestones(

    milestones=[]

){


    if(
        !Array.isArray(milestones) ||
        milestones.length===0
    ){

        return `

        <p>
        No milestones available.
        </p>

        `;

    }





    return `


    <div class="milestone-list">


    ${
        milestones.map(

            milestone=>`


            <div class="milestone-item">


                <strong>
                    Week ${milestone.week}
                </strong>


                <p>

                    ${
                        milestone.goal ||
                        milestone.description ||
                        "Progress target"

                    }

                </p>


            </div>


            `

        ).join("")

    }


    </div>


    `;


}