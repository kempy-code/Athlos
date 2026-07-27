// =====================================
// ATHLOS ANALYTICS CHARTS
// =====================================


export function renderCharts(container, plan){


console.log(
    "Charts loading",
    plan
);



if(!container){

console.error(
"Analytics container missing"
);

return;

}



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



<div class="charts-grid">


<div class="chart-card">

<h3>
Weekly Training Volume
</h3>


<canvas id="volumeChart"></canvas>


</div>





<div class="chart-card">

<h3>
Training Intensity
</h3>


<canvas id="intensityChart"></canvas>


</div>



</div>


</div>


`;




if(typeof Chart === "undefined"){


console.error(
"Chart.js not loaded"
);


return;

}





const weeks =
plan.progression?.weekly_training_load;



console.log(
"Chart data:",
weeks
);



if(!weeks || weeks.length===0){


console.error(
"No progression data"
);


return;


}





new Chart(

document.getElementById(
"volumeChart"
),

{

type:"line",


data:{


labels:

weeks.map(
w=>`Week ${w.week}`
),


datasets:[

{

label:"Training Volume",

data:

weeks.map(
w=>Number(w.volume)||0
),

tension:0.4

}

]

}



}

);






new Chart(

document.getElementById(
"intensityChart"
),

{

type:"bar",


data:{


labels:

weeks.map(
w=>`Week ${w.week}`
),


datasets:[

{

label:"Intensity /10",

data:

weeks.map(
w=>Number(w.intensity)||0
)

}

]


}



}

);



}