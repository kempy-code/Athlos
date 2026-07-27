export function renderNutrition(container,nutrition={}){


if(!container){

return;

}




container.innerHTML=`


<div class="dashboard-section">


<div class="section-header">

<h2>
Nutrition Targets
</h2>

<p>
Fuel your training
</p>

</div>



<div class="nutrition-grid">


${card(
"Calories",
nutrition.calories
)}


${card(
"Protein",
nutrition.protein
)}


${card(
"Carbohydrates",
nutrition.carbohydrates
)}


${card(
"Fat",
nutrition.fat
)}


${card(
"Hydration",
nutrition.hydration
)}



</div>




<div class="nutrition-notes">

<h3>
Coach Notes
</h3>

<p>

${nutrition.notes}

</p>


</div>


</div>


`;

}



function card(title,value){


return `

<div class="nutrition-card">


<span>

${title}

</span>


<strong>

${value || "-"}

</strong>


</div>

`;

}