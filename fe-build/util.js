'use strict';

const path = require('path');
const fs = require('fs');
const log = require('gulplog');

function copyFiles(filePathArray, folderArray) {
	filePathArray.forEach((filePath => {
		// ignore non-existing source files
		if (fs.existsSync(filePath)) {
			const fileName = path.basename(filePath);
			folderArray.forEach((targetFolder => {
				if (!fs.existsSync(targetFolder)) {
					log.info(`create target-folder ${targetFolder}`);
					fs.mkdirSync(targetFolder, {recursive: true});
				}
				const target = path.resolve(targetFolder, fileName);
				log.debug(`copy file '${filePath}' to '${target}'`);
				fs.copyFileSync(filePath, target);
			}));
		}
	}));
}

function deleteFiles(folderPathArray, fileNameArray) {
	folderPathArray.forEach(folder => {
		fileNameArray.forEach(fileName => {
			const f = path.resolve(folder, fileName);
			fs.rmSync(f, {force: true});
		});
	});
}

function fileNames(filePathArray) {
	return filePathArray.map(f => path.basename(f));
}

module.exports = {fileNames, copyFiles, deleteFiles};
