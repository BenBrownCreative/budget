// Budget Controller
var budgetCtrl = (function() {

  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calculatePercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    }
    else {
      this.percentage = -1;
    }
  }

  Expense.prototype.getPercentage = function() {
    return this.percentage; 
  }

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(cur) {
      sum += cur.value;
    });
    data.totals[type] = sum;
  };

  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc:0
    },
    budget: 0,
    percentage: -1
  }

  

  return { 

    addItem: function(type, desc, val) {
      var newItem, ID;

      // create new id
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      }
      else {
        ID = 1;
      }

      // create new item
      if (type === 'exp') {
        newItem = new Expense(ID, desc, val);
      } 
      else if (type === 'inc'){
        newItem = new Income(ID, desc, val);
      }
      
      // push new item
      data.allItems[type].push(newItem);

      // return new element
      return newItem;
    },

    deleteItem: function(type, id) {  
      var ids, index;
      
      ids = data.allItems[type].map(function(current) {
        return current.id;
      });
      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }

    },

    calculateBudget: function() {

      // calculate total income and expenses
      calculateTotal('exp');
      calculateTotal('inc');

      // calculate the budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp;

      // calculate the percentage of income that we spend
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } 
      else {
        data.percentage = -1;
      }
      
    },

    calculatePercentages: function() {

      data.allItems.exp.forEach(function(cur) {
        cur.calculatePercentage(data.totals.inc);
      });

    },

    getPercentages: function() {
      var allPercentages = data.allItems.exp.map(function(cur) {
        return cur.getPercentage();
      });
      return allPercentages;
    },

    getBudget: function() {
      return {
        budget: data.budget,
        percentage: data.percentage,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp
      }
    },

     testing: function() {
      console.log(data);
    }
  };

})();


// UI Controller
var uiCtrl = (function() {

  var DOMstrings = {
    inputType: '.add__type', 
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputButton: '.add__btn', 
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercentageLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  }
  
  var formatNumber = function(num, type) {
    var numSplit, int, dec;
    // + or - before number
    // exactly 2 decimal points
    // comma separating the thousands

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.');

    int = numSplit[0];
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
    }

    dec = numSplit[1];

    return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
  };

  var nodeListForEach = function(list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

    return {
      getInput: function() {
        return {
          type: document.querySelector(DOMstrings.inputType).value, // expected inc or exp
          description: document.querySelector(DOMstrings.inputDescription).value,
          value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
        }
      },

      addListItem: function(obj, type) {
        var html, newHtml, element, clearFields;

        // create html string with placeholder text
        if (type === 'inc') {
          element = DOMstrings.incomeContainer;
          html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
        }
        else if (type === 'exp') {
          element = DOMstrings.expensesContainer;
          html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
        }

        // replace the placeholder text
        newHtml = html.replace('%id%', obj.id);
        newHtml = newHtml.replace('%description%', obj.description);
        newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

        // insert the html into the dom
        document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

      },

      deleteListItem: function(selectorId) {
        var el = document.getElementById(selectorId);
        el.parentNode.removeChild(el);
      },
 
      clearFields: function() {
        var fields, fieldsArr; 

        fields = document.querySelectorAll(DOMstrings.inputDescription + ', '  + DOMstrings.inputValue);

        fieldsArr = Array.prototype.slice.call(fields);

        fieldsArr.forEach(function(current, index, array) {
          current.value = "";
        });

        fieldsArr[0].focus();

      },

      displayBudget: function(obj) {
        obj.budget > 0 ? type = 'inc' : type = 'exp';
        document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, (obj.budget >= 0 ? 'inc' : 'exp'));
        document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
        document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

        if (obj.percentage > 0) {
          document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
        }
        else {
          document.querySelector(DOMstrings.percentageLabel).textContent = '---';
        }
      },

      displayPercentages: function(percentages) {
        var fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);

        
        nodeListForEach(fields, function(current, index) {
          if (percentages[index] > 0) {
            current.textContent = percentages[index] + '%';
          }
          else {
            current.textContent = '---';
          }
          
        });

      },

      displayMonth: function() {
        var now, year, month, months;
        
        now = new Date();
        year = now.getFullYear();
        months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        month = now.getUTCMonth();

        document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;

      },

      changedType: function() {

          var fields = document.querySelectorAll(
            DOMstrings.inputType + ',' + 
            DOMstrings.inputDescription + ',' + 
            DOMstrings.inputValue 
          );
          
          nodeListForEach(fields, function(cur) {
            cur.classList.toggle('red-focus');
          });

          document.querySelector(DOMstrings.inputButton).classList.toggle('red');

      },

      getDOMstrings: function() {
        return DOMstrings;
      }
    }


})();



// Global App Controller
var appController = (function(budgetCtrl, uiCtrl) {

  var setupEventListeners = function() {

    var DOM = uiCtrl.getDOMstrings();

    document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);

    document.addEventListener('keypress', function(e) {
      if (e.keyCode === 13) {
        ctrlAddItem();
      }
    });

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    document.querySelector(DOM.inputType).addEventListener('change', uiCtrl.changedType);
  };

  var updateBudget = function() {

    // calculate the budget
    budgetCtrl.calculateBudget();

    // return budget
    var budget = budgetCtrl.getBudget();

    // display the budget
    uiCtrl.displayBudget(budget);
  };

  var updatePercentages = function() {

    // calculate percentages
    budgetCtrl.calculatePercentages();
    
    // read percentages from the budget controller
    var percentages = budgetCtrl.getPercentages();

    // update the ui
    uiCtrl.displayPercentages(percentages);

  };

  var ctrlAddItem = function() {
    var input, newItem;

    // get field input data
    input = uiCtrl.getInput();
    if (input.description !== '' && !isNaN(input.value) && input.value > 0) {

      // add the item to the budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      // add the item to the ui
      uiCtrl.addListItem(newItem, input.type);

      // clear the fields
      uiCtrl.clearFields();

      // calculate and update budget
      updateBudget();

      // calculate and update percentages
      updatePercentages();

    }

  };

  var ctrlDeleteItem = function(event) {

    var itemId = event.target.parentNode.parentNode.parentNode.parentNode.id

    if (itemId) {
      splitId = itemId.split('-');
      type = splitId[0];
      id = parseInt(splitId[1]);

      // delete item from data structure
      budgetCtrl.deleteItem(type, id);

      // delete item from ui
      uiCtrl.deleteListItem(itemId);

      // update and show new budget
      updateBudget();

      // calculate and update percentages
      updatePercentages();

    }

  };

  return {
    init: function() {
      uiCtrl.displayMonth();
      uiCtrl.displayBudget({
        budget: 0,
        percentage: -1,
        totalInc: 0,
        totalExp: 0
      });
      setupEventListeners();
    }
  };
    

})(budgetCtrl, uiCtrl);

appController.init();





