function SportsFilter(props) {

	const handleCheckboxChange = (event) => {
		const sport = event.target.id;
		const checked = event.target.checked;
		let temp = new Set(props.filters.sports);
		if (checked) {
			temp.add(sport);
		} else {
			temp.delete(sport);
		}
		props.setFilters({ ...props.filters, sports: temp })
	}

  return (
		<div class="dropdown">
  		<button type="button" class="btn btn-outline-dark dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
    		Sport
  		</button>
			<ul class="dropdown-menu">
				<li>
					<input 
						class="form-check-input" 
						type="checkbox" 
						id="all" 
						style={{ marginRight: "10px", marginLeft: "10px" }} 
						onChange={(e) => {
							if (e.target.checked) {
								props.setFilters({ ...props.filters, sports: props.sports })
								// set all sports to checked
								for (let sport of props.sports) {
									document.getElementById(sport).checked = true;
								}
							} else {
								props.setFilters({ ...props.filters, sports: new Set() })
								// set all sports to unchecked
								for (let sport of props.sports) {
									document.getElementById(sport).checked = false;
								}
							}}
						}
						checked={props.filters.sports.size === props.sports.size}
					/>
					<label class="form-check-label" for="all"> Select All </label>
				</li>
				<li><hr class="dropdown-divider"/></li>
				{[...props.sports].sort().map((sport) => (
					<li>
						<input 
							class="form-check-input" 
							type="checkbox" 
							id={sport} 
							style={{ marginRight: "10px", marginLeft: "10px" }} 
							onChange={handleCheckboxChange}
							checked={props.filters.sports.has(sport)}
						/>
						<label class="form-check-label" for={sport}> {sport} </label>
					</li>
				))}
			</ul>
		</div>
	)
}

export default SportsFilter;