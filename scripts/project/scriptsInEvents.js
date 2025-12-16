


const scriptsInEvents = {

	async MenuEvents_Event107_Act2(runtime, localVars)
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

	async MenuEvents_Event108_Act1(runtime, localVars)
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

