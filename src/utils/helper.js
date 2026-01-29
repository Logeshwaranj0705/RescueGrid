import moment from "moment";

export const validateEmail = (email) =>{
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

export const getInitials = (name) =>{
    if (!name) return "";

    const words =name.split(" ");
    let initials ="";

    for(let i = 0 ; i < Math.min(words.length, 2); i++){
        initials += words[i][0];
    }
    return initials.toUpperCase();
};

export const prepareCustomerCountByDate = (data = []) => {
    const counts = {};

    data.forEach((item) => {
        const day = moment(item.date).format("YYYY-MM-DD");

        if (!counts[day]) counts[day] = 0;
        counts[day] += 1;
    });

    return Object.keys(counts)
        .sort()
        .map((day) => ({
            date: moment(day).format("Do MMM"), 
            count: counts[day],
        }));
};

export const prepareEmployeeByCount = (data = []) => {
  return data.map((item) => ({
    name: item.employeeName,
    count: item.count
  }));
};

export const addThousandsSeparator =(num) =>{
    if(num == null || isNaN(num)) return "";

    const [integerPart, fractionalPart] = num.toString().split(".");
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return fractionalPart
    ? `${formattedInteger}.${fractionalPart}`
    : formattedInteger
};