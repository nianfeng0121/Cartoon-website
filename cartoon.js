var allCharacterList = []; // character list container
var newCharacterList = [];
//relevant to startDragging method()
var isDragging = false;
var currentSlider, currentKnob, currentValueSpan;
// New global variable to store comparison history 新增全局变量来存储比较历史记录
var comparisonHistory = [];


document.addEventListener("DOMContentLoaded", function() {
  setInitialKnobPositions('sliderStrength', 'knobStrength1', 'knobStrength2', 'valueStrength1', 'valueStrength2', 20, 80);
  setInitialKnobPositions('sliderSpeed', 'knobSpeed1', 'knobSpeed2', 'valueSpeed1', 'valueSpeed2', 20, 80);
  setInitialKnobPositions('sliderSkill', 'knobSkill1', 'knobSkill2', 'valueSkill1', 'valueSkill2', 0, 100);
  setInitialKnobPositions('sliderFearFactor', 'knobFearFactor1', 'knobFearFactor2', 'valueFearFactor1', 'valueFearFactor2', 0, 100);
  setInitialKnobPositions('sliderPower', 'knobPower1', 'knobPower2', 'valuePower1', 'valuePower2', 0, 100);
  setInitialKnobPositions('sliderIntelligence', 'knobIntelligence1', 'knobIntelligence2', 'valueIntelligence1', 'valueIntelligence2', 0, 100);
  setInitialKnobPositions('sliderWealth', 'knobWealth1', 'knobWealth2', 'valueWealth1', 'valueWealth2', 0, 100);
});
function processSearch(event) {
  search(event.target.value.trim());
}
var obj = {
  fear_factor
    :
    80,
  image_url
    :
    "images/batman.jpg",
  intelligence
    :
    90,
  name
    :
    "Batman",
  power
    :
    80,
  skill: 90,
  speed: 40,
  strength: 40,
  subtitle: "The Dark Knight",
  wealth: 100
}
function search(searchValue) {
 
  if (searchValue === "") {
    // If the search value is empty, load all characters
    loadCharacters(allCharacterList);
} else {
    // Filter characters by name based on the search value
    newCharacterList = allCharacterList.filter(character => 
        character.name.toLowerCase().includes(searchValue.toLowerCase())
    );
    loadCharacters(newCharacterList);
}
}
//window onload
window.onload = function () {
  
  getJsonObject('data.json',
    function (data) {
      allCharacterList = data.Characters;
      loadCharacters(allCharacterList);
    },
    function (xhr) { console.error(xhr); }
  );
  // listening to searches
   document.getElementById("characterSearch").addEventListener("input", processSearch); 
   document.addEventListener("mousemove", function(event) {
    if (isDragging) {
        updateKnobPosition(event.clientX);
    }
   });
   document.addEventListener("mouseup", function() {
       isDragging = false;
   });
   showPlaceholder("firstimg", "firstname");
   showPlaceholder("secondimg", "secondname"); 
}
let selectedCharacters = [];
//function of getJson 
function getJsonObject(path, success, error) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        if (success) success(JSON.parse(xhr.responseText));
      } else {
        if (error) error(xhr);
      }
    }
  };
  xhr.open("GET", path, true);
  xhr.send();
}

function loadCharacters(characters) {
    const table = document.getElementById('dataTable');

    // delete all rows for table
    while (table.rows.length > 0) {
      table.deleteRow(0); // Adjusted from deleteRow(0) to deleteRow(1) to correctly clear rows
    }

     if (characters.length === 0) {
      const row = table.insertRow();
      const cell = row.insertCell();
      cell.textContent = "No characters found";
      cell.colSpan = 10; // Adjust this to match the number of columns in your table
      return;
  }
    // Add a row to the table for each role 为每个角色添加一行到表格中
    characters.forEach(character => {
        const row = table.insertRow(); // add at the end

        // create and insert data 创建并填充数据到单元格
        row.insertCell().textContent = character.name;
        row.insertCell().textContent = character.strength;
        row.insertCell().textContent = character.speed;
        row.insertCell().textContent = character.skill;
        row.insertCell().textContent = character.fear_factor;
        row.insertCell().textContent = character.power;
        row.insertCell().textContent = character.intelligence;
        row.insertCell().textContent = character.wealth;

        // Creating a checkbox and adding it to the last cell 创建选择框并添加到最后一个单元格
        const selectCell = row.insertCell();
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';

        checkbox.dataset.characterName = character.name; //Use the data-* attribute to store role names  使用 data-* 属性来存储角色名字
        const isSelected = selectedCharacters.some(selected => selected.name === character.name);  //Check if the current role has been selected 检查当前角色是否已经被选中
        checkbox.checked = isSelected; // Setting the state of checkbox 设置复选框的状态

        checkbox.addEventListener('change', function () {
            if (this.checked) {
                selectedCharacters.push(character); // Modify this to store the entire role object 修改此处以存储整个角色对象
                if (selectedCharacters.length > 2) {// If there are more than two, the earliest selected one is removed and its corresponding tick is unchecked 如果超过两个，则移除最早选中的一个，并取消其对应的勾选
                    const removedCharacter = selectedCharacters.shift();//// Uncheck the checkbox for the first character selected 取消最先选中角色的复选框
                    const checkboxes = document.querySelectorAll('#dataTable input[type="checkbox"][data-character-name="' + removedCharacter.name + '"]');
                    if (checkboxes.length > 0) {
                        checkboxes[0].checked = false;
                    }
                }
            } else {// Remove from list if unselected 如果取消选择，则从列表中移除
                const index = selectedCharacters.findIndex(c => c.name === character.name);
                if (index > -1) {
                    selectedCharacters.splice(index, 1);
                }
            }
            toggleCheckboxes();
            updateComparisonTable(selectedCharacters);
        });
        selectCell.appendChild(checkbox);
    });
    // After all rows have been added, make sure to update the enable/disable status of the checkboxes based on the status of the currently selected items 在完成所有行的添加后，确保根据当前选中的项目状态更新复选框的启用/禁用状态
    toggleCheckboxes();
}

//Updated checkboxes to select up to 2 character comparisons 更新复选框，最多只能选择2个人物对比
function toggleCheckboxes() {
    const checkboxes = document.querySelectorAll('#dataTable input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        if (selectedCharacters.length >= 2) {
            if (checkbox.checked) {
                checkbox.disabled = false;
            } else {
                checkbox.disabled = true;
            }
        } else {
            checkbox.disabled = false;
        }
    });
}
function updateHistory() {
    const historyTable = document.getElementById('history-table');
    // Make sure you only add a pair of characters once 确保只添加一对人物一次
    if (selectedCharacters.length == 2) {
        const row = historyTable.insertRow();
        row.insertCell().textContent = `${selectedCharacters[0].name}`;
        row.insertCell().textContent = `${selectedCharacters[1].name}`;
        // Empty the selected character for new selection 清空选中的人物以便新的选择
        selectedCharacters = [];
    }
}
// Checks if the given role pair already exists in the history record 检查给定的角色对是否已存在于历史记录中
function isComparisonDuplicate(characterPair) {
  // 使用JSON.stringify来比较对象的字符串表示  Using JSON.stringify to compare string representations of objects
  // 注意：这假设characterPair数组中的角色顺序总是一致的  Note: This assumes that the order of the characters in the characterPair array is always the same
  const pairString = JSON.stringify(characterPair.map(char => char.name).sort());
  return comparisonHistory.some(existingPair => JSON.stringify(existingPair.map(char => char.name).sort()) === pairString);
}

// 添加一个新函数来重置背景颜色为黑色  Add a new function to reset the background colour to black
function resetBackgroundColor() {
  var descriptionArea = document.querySelector('.description-area');
  descriptionArea.style.background = 'black';
}

function updateComparisonTable(selectedCharacters) {
   // 先清空比较结果  Clear the comparison results first
    document.getElementById("shows1").textContent = "";
    document.getElementById("shows2").textContent = "";
    document.getElementById("showsSpeed1").textContent = "";
    document.getElementById("showsSpeed2").textContent = "";
    document.getElementById("showsSkill1").textContent = "";
    document.getElementById("showsSkill2").textContent = "";
    document.getElementById("showsFear1").textContent = "";
    document.getElementById("showsFear2").textContent = "";
    document.getElementById("showsPower1").textContent = "";
    document.getElementById("showsPower2").textContent = "";
    document.getElementById("showsIntelligence1").textContent = "";
    document.getElementById("showsIntelligence2").textContent = "";
    document.getElementById("showsWealth1").textContent = "";
    document.getElementById("showsWealth2").textContent = "";
    let winsCounter = { character1: 0, character2: 0 };
    if (selectedCharacters.length === 0) {     
    // 如果没有选中任何角色，则两边都显示占位符  If no roles are selected, placeholders are displayed on both sides
    showPlaceholder("firstimg", "firstname");     
    showPlaceholder("secondimg", "secondname");
    resetBackgroundColor();
     return;
        } 
    // 确保只添加一对人物一次  Make sure you only add a pair of characters once
    else if (selectedCharacters.length == 1) {
        var name = selectedCharacters[0].name;
        var image_url = selectedCharacters[0].image_url;
        document.getElementById("firstname").innerHTML = name;//名称 name
        document.getElementById("firstimg").src = image_url; // 图片 image
         // 另一边显示占位符 The other side shows placeholders
        showPlaceholder("secondimg", "secondname");
        document.getElementById("STRENGTHV1").innerHTML = selectedCharacters[0].strength;
        document.getElementById("SPEEDV1").innerHTML = selectedCharacters[0].speed;
        document.getElementById("SKILLV1").innerHTML = selectedCharacters[0].skill;
        document.getElementById("FEARV1").innerHTML = selectedCharacters[0].fear_factor;
        document.getElementById("POWERV1").innerHTML = selectedCharacters[0].power;
        document.getElementById("INTELLIGENCEV1").innerHTML = selectedCharacters[0].intelligence;
        document.getElementById("WEALTHV1").innerHTML = selectedCharacters[0].wealth;
        resetBackgroundColor();
        return;
    }
     else if (selectedCharacters.length ==2) {
      document.getElementById("firstname").innerHTML = selectedCharacters[0].name;
      document.getElementById("firstimg").src = selectedCharacters[0].image_url;
      document.getElementById("secondname").innerHTML = selectedCharacters[1].name;
      document.getElementById("secondimg").src = selectedCharacters[1].image_url;

     // 保存和展示比较历史  load and display history records
      if (!isComparisonDuplicate(selectedCharacters)) {
                comparisonHistory.push([...selectedCharacters]);
                updateHistoryDisplay();
      }
      //更新人物对比的名称  Updated names for character comparisons
        document.getElementById("STRENGTHV2").innerHTML = selectedCharacters[1].strength;
        document.getElementById("SPEEDV2").innerHTML = selectedCharacters[1].speed;
        document.getElementById("SKILLV2").innerHTML = selectedCharacters[1].skill;
        document.getElementById("FEARV2").innerHTML = selectedCharacters[1].fear_factor;
        document.getElementById("POWERV2").innerHTML = selectedCharacters[1].power;
        document.getElementById("INTELLIGENCEV2").innerHTML = selectedCharacters[1].intelligence;
        document.getElementById("WEALTHV2").innerHTML = selectedCharacters[1].wealth;
    }
       // 重置  reset selectedCharacters
        selectedCharacters = [];

         let STRENGTH1= parseFloat(document.getElementById("STRENGTHV1").innerHTML,10);//左边用于对比的STRENGT属性  STRENGT attribute on the left for comparison purposes
         let STRENGTH2=parseFloat(document.getElementById("STRENGTHV2").innerHTML,10);//右边边用于对比的STRENGT属性 STRENGT attribute for comparison on the right side
         let SPEEDV1 = parseFloat(document.getElementById("SPEEDV1").innerHTML,10);
         let SPEEDV2 = parseFloat(document.getElementById("SPEEDV2").innerHTML,10);
         let SKILLV1 = parseFloat(document.getElementById("SKILLV1").innerHTML,10);
         let SKILLV2 = parseFloat(document.getElementById("SKILLV2").innerHTML,10);
         let FEARV1 = parseFloat(document.getElementById("FEARV1").innerHTML, 10);
         let FEARV2 = parseFloat(document.getElementById("FEARV2").innerHTML, 10);
         let POWERV1 = parseFloat(document.getElementById("POWERV1").innerHTML, 10);
         let POWERV2 = parseFloat(document.getElementById("POWERV2").innerHTML, 10);
         let INTELLIGENCEV1 = parseFloat(document.getElementById("INTELLIGENCEV1").innerHTML, 10);
         let INTELLIGENCEV2 = parseFloat(document.getElementById("INTELLIGENCEV2").innerHTML, 10);
         let WEALTHV1 = parseFloat(document.getElementById("WEALTHV1").innerHTML, 10);
         let WEALTHV2 = parseFloat(document.getElementById("WEALTHV2").innerHTML, 10);
         //debugger;


    compareAndUpdate(STRENGTH1, STRENGTH2, winsCounter, "shows1", "shows2");
    compareAndUpdate(SPEEDV1, SPEEDV2, winsCounter, "showsSpeed1", "showsSpeed2");
    compareAndUpdate(SKILLV1, SKILLV2, winsCounter, "showsSkill1", "showsSkill2");
    compareAndUpdate(FEARV1, FEARV2, winsCounter, "showsFear1", "showsFear2");
    compareAndUpdate(POWERV1, POWERV2, winsCounter, "showsPower1", "showsPower2");
    compareAndUpdate(INTELLIGENCEV1, INTELLIGENCEV2, winsCounter, "showsIntelligence1", "showsIntelligence2");
    compareAndUpdate(WEALTHV1, WEALTHV2, winsCounter, "showsWealth1", "showsWealth2");

 adjustBackgroundColor(winsCounter.character1, winsCounter.character2);
  // reset重置selectedCharacters
  selectedCharacters = [];
    //change checkbox condition
}
function showTick(elementId, winsForCharacter) {
  if(winsForCharacter > 0) {
    document.getElementById(elementId).innerHTML = "<img src='images/whitetick.svg' alt='√' style='width:20px; height:20px;'>";
  } else {
    document.getElementById(elementId).innerHTML = "";
  }
}
// 比较两个值并更新计数器和勾选状态 Compare the two values and update the counters and tick states
function compareAndUpdate(character1Value, character2Value, winsCounter, elementId1, elementId2) {
  if (character1Value > character2Value) {
    winsCounter.character1++;
    showTick(elementId1, 1);
  } else if (character1Value < character2Value) {
    winsCounter.character2++;
    showTick(elementId2, 1);
  } else {
    if (Math.random() < 0.5) {
      winsCounter.character1++;
      showTick(elementId1, 1);
    } else {
      winsCounter.character2++;
      showTick(elementId2, 1);
    }
  }
}

function adjustBackgroundColor(winsForCharacter1, winsForCharacter2) {
  var descriptionArea = document.querySelector('.description-area');

  if (winsForCharacter1 > winsForCharacter2) {
      // 左边获胜次数多，设置相应的背景颜色  The left has won more times, set the background colour accordingly
      descriptionArea.style.background = 'linear-gradient(to right, green 35%, black 35%, black 65%, red 65%)';
  } else if (winsForCharacter1 < winsForCharacter2) {
      // 右边获胜次数多，设置相应的背景颜色  The right side has won more times, set the background colour accordingly
      descriptionArea.style.background = 'linear-gradient(to right, red 35%, black 35%, black 65%, green 65%)';
  } else {
      // 如果获胜次数相等，随机选择一个胜利  If there are an equal number of wins, one is chosen at random.
      if (Math.random() < 0.5) {
          descriptionArea.style.background = 'linear-gradient(to right, green 35%, black 35%, black 65%, red 65%)';
      } else {
          descriptionArea.style.background = 'linear-gradient(to right, red 35%, black 35%, black 65%, green 65%)';
      }
  }
}

function showPlaceholder(imgId, nameId) {
  // 显示占位符  Show placeholders
  document.getElementById(nameId).innerHTML = "Unknown"; // 此处可以调整为需要显示的未知角色名字  This can be adjusted to the name of the unknown character that needs to be displayed
  document.getElementById(imgId).src = "images/question-mark.png"; // 此处路径替换为问号图片的路径  Replace this path with the path of the question mark image
}

function clearComparisonArea() {
  // 清空对比区域的函数 Functions to clear the comparison area
  document.getElementById("firstname").innerHTML = '';
  document.getElementById("firstimg").src = '';
  document.getElementById("secondname").innerHTML = '';
  document.getElementById("secondimg").src = '';
}

// 更新历史记录的显示 Updating the display of the history
function updateHistoryDisplay() {
  const historyTable = document.getElementById('comparisonHistory');
    // 首先清空历史记录表格的当前内容  First clear the current contents of the history form
    historyTable.innerHTML = '';
    comparisonHistory.forEach((pair, index) => {
        // 创建一个新的行 Create a new row
        const row = historyTable.insertRow();
        // 设置行的 data-index 属性，以便后面识别和选择历史记录项  Set the data-index attribute of a row to identify and select history items later on
        row.setAttribute('data-index', index); 
        // 创建两个单元格用于展示角色名称  Create two cells for displaying role names
        const cell1 = row.insertCell();
        cell1.textContent = pair[0].name;
        const cell2 = row.insertCell();
        cell2.textContent = pair[1].name;
        // 添加点击事件监听器，用于选择历史记录中的这对角色  Add a click event listener for selecting this pair of roles in history
        row.addEventListener('click', () => {
            selectCharactersFromHistory(index);
        });
    });
}

// 根据历史记录选择角色进行比较  Select roles for comparison based on history
function selectCharactersFromHistory(index) {
  const pair = comparisonHistory[index];
  if (pair && pair.length == 2) {
      // 清除当前选择的角色 Clear the currently selected character
      selectedCharacters = [];
      // 重新选择历史记录中的这两个角色 Reselect both roles in the history
      selectedCharacters.push(pair[0], pair[1]);
      // 更新对比区域显示 Updated Comparison Area Display
      updateComparisonTable(selectedCharacters);
       // 更新复选框状态 Update checkbox status
    updateCheckboxesFromSelection(selectedCharacters);
  }
}

// 更新表格中的复选框状态，以匹配选中的角色  Update the status of the checkboxes in the form to match the selected roles
function updateCheckboxesFromSelection(selectedCharacters) {
  const checkboxes = document.querySelectorAll('#dataTable input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    // 首先，将所有复选框设为未勾选状态  First, make all checkboxes unchecked
    checkbox.checked = false;
  });

  // 然后，仅为当前选中的角色勾选复选框  Then, tick the checkboxes for only the currently selected roles
  selectedCharacters.forEach(character => {
    for (const checkbox of checkboxes) {
      // 获取复选框所在的行 Get the row where the checkbox is located
      const row = checkbox.closest('tr');
      // 比较行中角色的名字是否与选中的角色匹配  Compare the names of the roles in the rows to match the selected roles
      if (row.cells[0].textContent === character.name) {
        checkbox.checked = true;
        break; // 找到匹配项后不再继续查找  Do not continue searching after a match is found
      }
    }
  });

  toggleCheckboxes();
}

//填充滑动条颜色  Fill Slider Colour
function updateColorFill(sliderId) {
  var slider = document.getElementById(sliderId);
  var colorFill = slider.querySelector('.color-fill');
  var knob1 = slider.querySelector('.knob1');
  var knob2 = slider.querySelector('.knob2');

  // 计算并更新颜色填充的位置和宽度  Calculate and update the position and width of the colour fill
  var startPos = Math.min(knob1.offsetLeft, knob2.offsetLeft) + knob1.offsetWidth / 2;
  var endPos = Math.max(knob1.offsetLeft, knob2.offsetLeft) + knob1.offsetWidth / 2;
  colorFill.style.left = startPos + 'px';
  colorFill.style.width = (endPos - startPos) + 'px';
}

//更新滑块位置  Update Slider Position
function updateKnobPosition(clientX) {
  var sliderRect = currentSlider.getBoundingClientRect();
  var sliderWidth = sliderRect.width - currentKnob.offsetWidth; // 考虑滑块宽度以防止滑出滑动条 Consider the width of the slider to prevent it from sliding out of the sliding bar
  var newPosition = clientX - sliderRect.left; // 滑块位置 非中心点  Slider position Non-centre
  if (newPosition < 0) {
      newPosition = 0;
  } else if (newPosition > sliderRect.width) {
      newPosition = sliderRect.width;
  }
  var otherKnobId = currentKnob.id.endsWith("1") ? currentKnob.id.replace("1", "2") : currentKnob.id.replace("2", "1");
  var otherKnob = document.getElementById(otherKnobId);
  var otherKnobPosition = parseFloat(otherKnob.style.left) + (otherKnob.offsetWidth / 2); // 根据滑块中心点调整位置 Adjustment of the position according to the centre point of the slider
  

  // 将位置调整为基于滑动条的宽度百分比而不是像素值  Adjust the position to be based on a percentage of the width of the slider rather than a pixel value
  if (currentKnob.id.endsWith("1")) { // 如果是左滑块  If the left slider
      if (newPosition  >= otherKnobPosition) { // 防止左滑块超过右滑块 Preventing the left slider from overtaking the right slider
          newPosition = otherKnobPosition;
          }
          currentKnob.style.left = newPosition - currentKnob.offsetWidth / 2 + "px";
          currentValueSpan.innerHTML = Math.round((newPosition / sliderRect.width) * 100);
  }
  else { // 如果是右滑块 right slider
      if (newPosition <= otherKnobPosition) { // 防止右滑块超过左滑块 Prevents the right slider from overtaking the left slider
          newPosition = otherKnobPosition;
          }
          currentKnob.style.left = newPosition - currentKnob.offsetWidth / 2 + "px";
          currentValueSpan.innerHTML = Math.round((newPosition / sliderRect.width) * 100);                
  }
// 根据当前拖动的滑块执行相应的搜索  Performs the appropriate search based on the currently dragged slider

  applyAllFilters(); // Replace individual search function calls with this
  updateColorFill(currentSlider.id);
}

//拖动 drag
function startDragging(event, slider, knob, valueSpan) {
    isDragging = true;
    currentSlider = slider;
    currentKnob = knob;
    currentValueSpan = valueSpan;
    event.stopPropagation();

}

function setInitialKnobPositions(sliderId, knob1Id, knob2Id, value1Id, value2Id, initial1, initial2) {
  var slider = document.getElementById(sliderId);
  var knob1 = document.getElementById(knob1Id);
  var knob2 = document.getElementById(knob2Id);
  var value1Span = document.getElementById(value1Id);
  var value2Span = document.getElementById(value2Id);
  
  updateKnobPositionDirect(slider, knob1, value1Span, initial1);
  updateKnobPositionDirect(slider, knob2, value2Span, initial2);

  function updateKnobPositionDirect(slider, knob, valueSpan, value) {
      var sliderRect = slider.getBoundingClientRect();
      var position = (value / 100) * sliderRect.width;
      knob.style.left = position - knob.offsetWidth / 2 + "px";//中心点 centre point
      valueSpan.innerHTML = value;
  }
    
  applyAllFilters(); // Add this line at the end of the function
  // Handle mouse events
  knob1.addEventListener("mousedown", function(event) { startDragging(event, slider, knob1, value1Span); });
  knob2.addEventListener("mousedown", function(event) { startDragging(event, slider, knob2, value2Span); });
  updateColorFill(sliderId);
}
// This function replaces individual search functions and applies all filters at once.
function applyAllFilters() {
  // Retrieve slider values
  var strengthLimits = getSliderLimits("valueStrength1", "valueStrength2");
  var speedLimits = getSliderLimits("valueSpeed1", "valueSpeed2");
  var skillLimits = getSliderLimits("valueSkill1", "valueSkill2");
  var fearFactorLimits = getSliderLimits("valueFearFactor1", "valueFearFactor2");
  var powerLimits = getSliderLimits("valuePower1", "valuePower2");
  var intelligenceLimits = getSliderLimits("valueIntelligence1", "valueIntelligence2");
  var wealthLimits = getSliderLimits("valueWealth1", "valueWealth2");
  // Apply combined filter
  newCharacterList = allCharacterList.filter(item => {
    return item.strength >= strengthLimits[0] && item.strength <= strengthLimits[1] &&
           item.speed >= speedLimits[0] && item.speed <= speedLimits[1] &&
           item.skill >= skillLimits[0] && item.skill <= skillLimits[1] &&
           item.fear_factor >= fearFactorLimits[0] && item.fear_factor <= fearFactorLimits[1] &&
           item.power >= powerLimits[0] && item.power <= powerLimits[1] &&
           item.intelligence >= intelligenceLimits[0] && item.intelligence <= intelligenceLimits[1] &&
           item.wealth >= wealthLimits[0] && item.wealth <= wealthLimits[1];
  });

        loadCharacters(newCharacterList);  // Load characters based on combined filters
  
}

// Helper function to get slider limits (min and max values)
function getSliderLimits(minId, maxId) {
  var minValue = parseInt(document.getElementById(minId).textContent, 10);
  var maxValue = parseInt(document.getElementById(maxId).textContent, 10);
  return [minValue, maxValue];
}
