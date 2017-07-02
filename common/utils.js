
// Some utility functions that are common to backend and the frontend.



class Utils {

  // Strips the middle name from a name
  // The given full name is the person's full name, including first, middle, and last names
  // Full name is often not equal to first + ' ' + middle + ' ' + last because many people have foreign names and nicknames.
  // If firstName and lastName are passed, the accuracy of this function should be higher.
  // This is used in mobile class panel view. 
  // And also when adding professor names (both from the employee data sources and from the classes data sources) to the search index.

  // TODO: Is it a good idea to strip the single character in names like [Aileen B Kent Yates] and [Edwin A. Marengo Fuentes] too? I think so. 

  stripMiddleName(fullName, keepIfMoreThanOneChar = false, firstName = null, lastName = null) {
    if ((!firstName && lastName) || (firstName && !lastName)) {
      console.error('Need either first and last name or neither first nor last name for stripeMiddleName.');
      console.trace();
      return null;
    }


    const indexOfFirstSpace = fullName.indexOf(' ');

    // If there are no spaces in this name, just return the full name.
    if (indexOfFirstSpace === -1) {
      return fullName;
    }


    let nameWithoutFirstAndLastName;

    if (firstName && lastName) {
      if (!fullName.startsWith(firstName)) {
        console.warn('Full name does not start with first name?', fullName, '|', firstName);
      }

      if (!fullName.endsWith(lastName)) {
        console.warn('Full name does not end with last name?', fullName, '|', lastName);
      }
    }

    // Find the last name and first name by splitting the name by spaces
    else {
      const indexOfLastSpace = fullName.length - fullName.split('').reverse().join('').indexOf(' ');

      firstName = fullName.slice(0, indexOfFirstSpace);
      lastName = fullName.slice(indexOfLastSpace);
    }

    // No need to calculate the middle name if we are going to drop in anyway. 
    if (!keepIfMoreThanOneChar) {
      return `${firstName} ${lastName}`
    }


    // If their middle name is one character (not including symbols), don't add it to the search index.
    // This prevents profs like Stacy C. Marsella from coming up when you type in [C]
    // First, remove the first and last names and toLowerCase()
    nameWithoutFirstAndLastName = fullName.replace(firstName, '').replace(lastName, '');

    // Then remove symbols.
    nameWithoutFirstAndLastName = nameWithoutFirstAndLastName.replace(/[^a-z0-9]/gi, '');

    // If little to nothing remains, just index the first and last names.
    if (keepIfMoreThanOneChar && nameWithoutFirstAndLastName.length > 1) {

      // Purge middle names that are only one char long
      let fullNameSplit = fullName.split(' ')

      // Of the names that remain, remove the ones that are only 1 letter long (not including symbols)
      fullNameSplit = fullNameSplit.filter(function (word) {
        if (word.replace(/[^a-zA-Z0-9]/gi,'').length < 2) {
          return false;
        }
        else {
          return true;
        }
      })

      return fullNameSplit.join(' ');
    }

    return `${firstName} ${lastName}`;
  }
}

export default new Utils();