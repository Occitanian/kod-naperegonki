


const scriptsInEvents = {

	async GameEvents_Event266_Act1(runtime, localVars)
	{
const CodeIframe = runtime.objects.CodeIframe.getFirstInstance();
const theme = localVars.theme; // "light" или "dark"

let bgColor, textColor, cursorColor;
if (theme === 'light') {
    bgColor = 'rgb(255, 255, 200)';   // светло-жёлтый
    textColor = '#000000';            // чёрный текст
    cursorColor = '#000000';          // чёрный курсор
} else {
    bgColor = 'rgb(25, 25, 25)';      // тёмно-серый
    textColor = '#ffffff';            // белый текст
    cursorColor = '#ffffff';          // белый курсор
}

const htmlContent = `<!DOCTYPE html>
<html>
<head>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/theme/darcula.min.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.js"></script>
<style>
  body, html { margin:0; padding:0; height:100%; overflow:hidden; background: ${bgColor}; }
  
  /* Основной контейнер */
  .CodeMirror { 
    height:100%; 
    font-size:16px; 
    background: ${bgColor} !important; 
    color: ${textColor} !important; 
  }

  /* Перебиваем тему Darcula для фона и текста */
  .cm-s-darcula.CodeMirror { background: ${bgColor} !important; color: ${textColor} !important; }
  .cm-s-darcula .CodeMirror-gutters { background: ${bgColor} !important; border-right: 1px solid rgba(128,128,128,0.3); }
  .cm-s-darcula .CodeMirror-linenumber { color: ${textColor} !important; opacity: 0.6; }
  .cm-s-darcula .CodeMirror-cursor { border-left: 2px solid ${cursorColor} !important; }

  /* Текст обычный и переменные (Исправлено: убрал дубликат) */
  .cm-s-darcula .CodeMirror-line { color: ${textColor} !important; }
  .cm-variable { color: ${theme === 'light' ? '#333333' : '#abb2bf'} !important; }

  /* Твои ключевые слова */
  .cm-for { color: rgb(0, 110, 255) !important; font-weight: bold; }
  .cm-while { color: rgb(30, 144, 255) !important; font-weight: bold; }
  .cm-if, .cm-elif { color: rgb(65, 105, 255) !important; font-weight: bold; }
  .cm-else { color: rgb(200, 0, 0) !important; font-weight: bold; }

  /* Твои команды движения */
  .cm-forward { color: rgb(50, 50, 255) !important; font-weight: bold; }
  .cm-left { color: rgb(255, 75, 0) !important; font-weight: bold; }
  .cm-right { color: rgb(0, 128, 0) !important; font-weight: bold; }

  /* Остальное */
  .cm-builtin { color: #e06c75 !important; }
  .cm-atom { color: #CD29D1 !important; font-weight: bold !important }
  .cm-number { color: #98c379 !important; }
  .cm-bracket { color: #56b6c2 !important; font-weight: bold; }
  .cm-comment { color: #5c6370 !important; font-style: italic !important; }

  .cm-s-darcula .CodeMirror-activeline-background { background: rgba(255, 255, 255, 0.1) !important; }
</style>
</head>
<body>
<textarea id="code"># Код писать здесь ^-^</textarea>
<script>
CodeMirror.defineMode("kittyscript", function() {
  const keywords = ["for", "while", "if", "elif", "else"];
  const atoms = ["north", "south", "east", "west", "front", "behind", "on_left", "on_right", "free", "wall", "true", "false"];
  const builtins = ["forward", "left", "right"];

  return {
    token: function(stream, state) {
      if (stream.eatSpace()) return null;
      if (stream.match(/^#.*/)) return "comment";
      if (stream.match(/^[a-zA-Z_][a-zA-Z0-9_]*/)) {
        const word = stream.current();
        if (keywords.includes(word)) return word;
        if (atoms.includes(word)) return "atom";
        if (word === "forward") return "forward";
        if (word === "left") return "left";
        if (word === "right") return "right";
        if (builtins.includes(word)) return "builtin";
        return "variable";
      }
      if (stream.match(/^\d+/)) return "number";
      if (stream.match(/^[()]/)) return "bracket";
      stream.next();
      return null;
    }
  };
});

var editor = CodeMirror.fromTextArea(document.getElementById('code'), {
  lineNumbers: true,
  mode: 'kittyscript',
  theme: 'darcula',
  indentUnit: 4,
  autoCloseBrackets: true,
  matchBrackets: true,
  lineWrapping: true
});

window.getCode = () => editor.getValue();
window.setCode = code => editor.setValue(code);
<\/script>
</body>
</html>`;

runtime.callFunction("SetIframeHTML", CodeIframe.uid, htmlContent);
	},

	async GameEvents_Event267_Act2(runtime, localVars)
	{
// Получаем iframe и код из редактора
const iframeObj = runtime.objects.CodeIframe.getFirstInstance();
const iframeWin = CodeIframe.contentWindow.window;

const queueObj = runtime.objects.Queue.getFirstInstance();

if (!iframeWin || !iframeWin.getCode) {
    console.log('Редактор ещё не загружен');
    return;
}
const code = iframeWin.getCode();


function parseCommands(text) {
    const lines = text.split('\n');
    const commands = [];
    const indentStack = [];

    lines.forEach(line => {
        // Удаляем комментарии и хвостовые пробелы
        line = line.replace(/#.*$/, '').trimRight();
        if (line.trim() === '') return;

        // Нормализуем табуляции в 4 пробела для точного подсчёта отступа
        const normalizedLine = line.replace(/\t/g, '    ');
        const indent = normalizedLine.search(/\S/);
        const trimmed = line.trim();

        // Закрываем блоки, уровень которых **строго больше** текущего отступа
        while (indentStack.length > 0 && indent < indentStack[indentStack.length - 1]) {
            commands.push('end');
            indentStack.pop();
        }

        // --- Определяем тип строки ---

        // for i in range(N):
        const forMatch = trimmed.match(/^for\s+\w+\s+in\s+range\s*\(\s*(\d+)\s*\)\s*:?\s*$/i);
        if (forMatch) {
            commands.push(`for|count|${forMatch[1]}`);
            indentStack.push(indent);
            return;
        }

        // while True: / while False:
        const whileBoolMatch = trimmed.match(/^while\s+(true|false)\s*:\s*$/i);
        if (whileBoolMatch) {
            const boolVal = whileBoolMatch[1].toLowerCase();
            commands.push(`while|always|${boolVal}`);
            indentStack.push(indent);
            return;
        }

        // while условие: while on_right(free):
        const whileCondMatch = trimmed.match(/^while\s+([a-z_]+)\(\s*(free|wall)\s*\)\s*:\s*$/i);
        if (whileCondMatch) {
            const direction = whileCondMatch[1];
            const condition = whileCondMatch[2];
            const absoluteDirs = ['north', 'south', 'east', 'west'];
            const relativeDirs = ['front', 'behind', 'on_left', 'on_right'];
            let type = absoluteDirs.includes(direction.toLowerCase()) ? 'absolute' : 'relative';
            commands.push(`while|${type}|${direction}|${condition}`);
            indentStack.push(indent);
            return;
        }

        // if условие:
        const ifMatch = trimmed.match(/^if\s+([a-z_]+)\(\s*(free|wall)\s*\)\s*:\s*$/i);
        if (ifMatch) {
            const direction = ifMatch[1];
            const condition = ifMatch[2];
            const absoluteDirs = ['north', 'south', 'east', 'west'];
            const relativeDirs = ['front', 'behind', 'on_left', 'on_right'];
            let type = absoluteDirs.includes(direction.toLowerCase()) ? 'absolute' : 'relative';
            commands.push(`if|${type}|${direction}|${condition}`);
            indentStack.push(indent);
            return;
        }

        // elif условие:
        const elifMatch = trimmed.match(/^elif\s+([a-z_]+)\(\s*(free|wall)\s*\)\s*:\s*$/i);
        if (elifMatch) {
            const direction = elifMatch[1];
            const condition = elifMatch[2];
            const absoluteDirs = ['north', 'south', 'east', 'west'];
            const relativeDirs = ['front', 'behind', 'on_left', 'on_right'];
            let type = absoluteDirs.includes(direction.toLowerCase()) ? 'absolute' : 'relative';
            commands.push(`elif|${type}|${direction}|${condition}`);
            // Не добавляем в стек — уровень не меняется
            return;
        }

        // else:
        const elseMatch = trimmed.match(/^else\s*:\s*$/i);
        if (elseMatch) {
            commands.push('else');
            // Не добавляем в стек
            return;
        }

        // Обычная команда вида forward()
        const cmdMatch = trimmed.match(/^([a-zA-Z_]+)\s*\(\s*\)\s*$/);
        if (cmdMatch) {
            commands.push(cmdMatch[1]);
            return;
        }

        // Если ничего не распознано
        console.warn('Неизвестная команда (пропущена):', trimmed);
    });

    // Закрываем все оставшиеся блоки в конце
    while (indentStack.length > 0) {
        commands.push('end');
        indentStack.pop();
    }

    return commands;
}

const cmdList = parseCommands(code);

// Устанавливаем размер
queueObj.setSize(cmdList.length, 3);
console.log(`Размер массива Queue установлен: ${cmdList.length} x 3`);

// Заполняем массив
cmdList.forEach((cmd, index) => {
    let type = 'lineal';
    if (cmd.startsWith('for|') || cmd.startsWith('if|') || cmd.startsWith('while|') || cmd.startsWith('elif|')) {
        type = 'cycle';
    } else if (cmd === 'end') {
        type = 'end';
    } else {
        // для else и обычных команд
        type = 'lineal';
    }

    try {
        queueObj.setAt(cmd, index, 0);
        queueObj.setAt(type, index, 1);
        queueObj.setAt(-1, index, 2);
        console.log(`  Установлено [${index},0] = "${cmd}", [${index},1] = "${type}", [${index},2] = -1`);
    } catch (e) {
        console.error(`  Ошибка при установке значения для index=${index}:`, e);
    }
});

console.log('Queue обновлён, команд:', cmdList.length);
	},

	async MenuEvents_Event110_Act2(runtime, localVars)
	{
		const Input = runtime.objects.Input.getFirstPickedInstance();
		
		Input.text = (function(input) {
		    // Разрешаем все буквы (включая ё/Ё), дефис и пробел
		    let cleaned = input.replace(/[^a-zA-Zа-яА-ЯёЁ\- ]/g, '');
		    
		    // Заменяем множественные пробелы на один
		    cleaned = cleaned.replace(/\s{2,}/g, ' ');
		    
		    // Убираем пробелы в начале и конце
		    cleaned = cleaned.trim();
		    
		    // Преобразуем всё в верхний регистр
		    cleaned = cleaned.toUpperCase();
		    
			return cleaned;
		})(Input.text);
	},

	async MenuEvents_Event111_Act1(runtime, localVars)
	{
		let CatSay = runtime.objects.Aqum.getFirstPickedInstance().instVars.Say;
		
		const BadwordsMap = runtime.objects.Badwords.getFirstPickedInstance().getDataMap(); // Переименовал переменную, чтобы подчеркнуть, что это Map
		const Input = runtime.objects.Input.getFirstPickedInstance();
		
		const inputTextLower = Input.text.toLowerCase(); // Преобразуем введенный текст в нижний регистр
		
		let foundBadWord = false; // Флаг для отслеживания, найдено ли плохое слово
		
		if (BadwordsMap) {
		  for (const [key, value] of BadwordsMap) {
		    if (inputTextLower.includes(key.toLowerCase())) { // Сравниваем в нижнем регистре, используя includes
		      CatSay = value;
		      Input.text = "";  // Очищаем поле ввода
		      foundBadWord = true;
		      break; // Прерываем цикл, если нашли первое совпадение
		    }
		  }
		} else {
		  console.warn("Словарь Badwords пуст или не найден.");
		}
		
		if (!foundBadWord) {
		  localVars.cat_name = Input.text;
		}
		
		runtime.objects.Aqum.getFirstPickedInstance().instVars.Say = CatSay;
	}

};

self.C3.ScriptsInEvents = scriptsInEvents;

