@echo off
cd /d %~dp0


pbjs -t static-module -w commonjs -o compiled.js  .\..\..\assets\resources\proto\*.proto
pbts -o compiled.d.ts compiled.js
tool.exe compiled.d.ts .\..\..\assets\scripts\def


@echo on