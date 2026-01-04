; build/installer.nsh
!include "LogicLib.nsh"
!include "StrFunc.nsh"
${StrFunc} RTrim
${StrFunc} StrCase
${StrFunc} StrStr

!define APPDIR "Apiflow"

Function .onVerifyInstDir
  ; 1) 去掉末尾空格（防止用户输入 "D:\demo   "）
  ${RTrim} $INSTDIR $INSTDIR

  ; 2) 处理用户只输入盘符 "D:" → "D:\"
  StrLen $0 $INSTDIR
  ${If} $0 == 2
    StrCpy $INSTDIR "$INSTDIR\"
  ${EndIf}

  ; 3) 去掉末尾 "\"（统一拼接，避免 "D:\demo\" + "\Apiflow" 变成双斜杠）
  StrLen $0 $INSTDIR
  ${If} $0 > 3
    StrCpy $1 $INSTDIR 1 -1
    ${If} $1 == "\"
      StrCpy $INSTDIR $INSTDIR -1
    ${EndIf}
  ${EndIf}

  ; 4) 如果已经以 "\Apiflow" 结尾，就不再追加（忽略大小写）
  ;    做法：把路径和目标都转小写比较
  StrCpy $2 $INSTDIR
  ${StrCase} $2 $2 "L"
  StrCpy $3 "\${APPDIR}"
  ${StrCase} $3 $3 "L"

  ; 检查是否包含末尾 "\apiflow"
  StrLen $4 $2
  StrLen $5 $3
  IntOp $6 $4 - $5
  ${If} $6 >= 0
    StrCpy $7 $2 $5 $6
    ${If} $7 == $3
      Return
    ${EndIf}
  ${EndIf}

  ; 5) 统一追加 "\Apiflow"
  ;    注意：如果是根目录 "D:\"，此时 $INSTDIR 长度=3，末尾是 "\"，直接拼接即可
  StrLen $0 $INSTDIR
  ${If} $0 == 3
    StrCpy $INSTDIR "$INSTDIR${APPDIR}"
  ${Else}
    StrCpy $INSTDIR "$INSTDIR\${APPDIR}"
  ${EndIf}
FunctionEnd
