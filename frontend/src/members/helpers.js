export const isPrincipal = member => member.id == member.family_id

/// Returns todays date.
export const getToday = () => {
    var today = new Date()
    var dd = String(today.getDate()).padStart(2, '0')
    var mm = String(today.getMonth() + 1).padStart(2, '0')
    var yyyy = today.getFullYear()

    today = yyyy + '-' + mm + '-' + dd
    return today
}