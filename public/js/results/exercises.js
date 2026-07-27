export function renderExercises(

container,

exercises=[]

){


if(!container){

return;

}



container.innerHTML=`


<div class="dashboard-section">


<div class="section-header">

<h2>
Exercise Library
</h2>

<p>
Your program's movement database
</p>

</div>



<table class="exercise-table">


<thead>

<tr>

<th>
Exercise
</th>

<th>
Category
</th>

<th>
Equipment
</th>

<th>
Sets
</th>

<th>
Reps
</th>

<th>
Rest
</th>

</tr>

</thead>



<tbody>


${
exercises.map(e=>`

<tr>

<td>
${e.name}
</td>


<td>
${e.category}
</td>


<td>
${e.equipment}
</td>


<td>
${e.sets}
</td>


<td>
${e.reps}
</td>


<td>
${e.rest}
</td>


</tr>


`).join("")
}



</tbody>


</table>


</div>


`;



}