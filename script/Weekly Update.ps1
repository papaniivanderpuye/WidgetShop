<################################################
#
# Update Database
#
#
#
#################################################>

$FilePath = 'C:\Users\trexer917\Comcast\TES Automation - Weekly Status Reports\TES Automation Status.xlsx'
$Logfile = 'C:\Logs\AutomationKPI.log'
$global:ProjectArray = @()
$global:MilestoneArray = @()
#$FilePath = 'C:\temp\status.xlsx'
#Dev Path
$global:URIPath = 'http://localhost:5000/v1/'



function LogWrite($logstring){
    Add-Content $Logfile -value $logstring
}

function findTables($search){
    #Find Tables
    $endRow = $global:Sheet.UsedRange.SpecialCells(11).Row

    for($Row = 1; $Row -le $endRow; $Row++){

        [string]$LeadCell = $global:Sheet.Cells.Item($Row,1).Value()

        if($LeadCell -eq $search){return $Row + 1}

    }
}

function getProjects(){
    $endRow = $global:Sheet.UsedRange.SpecialCells(11).Row

    $Head = findTables("Goals")
    $Proj = findTables("Project")
    
    #Read Project Information from Top
    for($Row = $Head; $Row -le $endRow; $Row++){
        $Goal = escapeString($global:Sheet.Cells.Item($Row,1).Value())
        $Project = escapeString($global:Sheet.Cells.Item($Row,2).Value())
        $Note = escapeString($global:Sheet.Cells.Item($Row,4).Value())
        if ($Project -eq "" -or $Project -eq $null){
            $Row = $endRow
        }
        Else{
            $tempObject = New-Object -TypeName PSObject
            $tempObject | Add-Member -MemberType NoteProperty -Name Name -Value $Project
            $tempObject | Add-Member -MemberType NoteProperty -Name Goal -Value $Goal
            $tempObject | Add-Member -MemberType NoteProperty -Name Note -Value $Note
        
            $global:ProjectArray += $tempObject

        }
    }

    #Read Remaining Project Information from Bottom
    for($Row = $Proj; $Row -le $endRow; $Row++){

        $new = $true
        
        $ProjName = escapeString($global:Sheet.Cells.Item($Row,1).Value())
        $Goal = escapeString($global:Sheet.Cells.Item($Row,2).Value())
        $ID = escapeString($global:Sheet.Cells.Item($Row,3).Value())
        $Description = escapeString($global:Sheet.Cells.Item($Row,4).Value())
        $Highlights = escapeString($global:Sheet.Cells.Item($Row,5).Value())
        $Risks = escapeString($global:Sheet.Cells.Item($Row,6).Value())
        $Owner = escapeString($global:Sheet.Cells.Item($Row,7).Value())

        if ($ProjName -eq "" -or $ProjName -eq $null){
            $Row = $endRow
        }
        else{
            $global:ProjectArray | ForEach-Object{
                if($ProjName -eq $_.Name){
                    $_ | Add-Member -MemberType NoteProperty -Name ID -Value $ID
                    $_ | Add-Member -MemberType NoteProperty -Name Description -Value $Description
                    $_ | Add-Member -MemberType NoteProperty -Name Highlights -Value $Highlights
                    $_ | Add-Member -MemberType NoteProperty -Name Risks -Value $Risks
                    $_ | Add-Member -MemberType NoteProperty -Name Owner -value $Owner

                    $new = $false
                }
            }

            if($new){
                $tempObject = New-Object -TypeName PSObject
                $tempObject | Add-Member -MemberType NoteProperty -Name Name -Value $ProjName
                $tempObject | Add-Member -MemberType NoteProperty -Name Goal -Value $Goal
                $tempObject | Add-Member -MemberType NoteProperty -Name ID -Value $ID
                $tempObject | Add-Member -MemberType NoteProperty -Name Description -Value $Description
                $tempObject | Add-Member -MemberType NoteProperty -Name Highlights -Value $Highlights
                $tempObject | Add-Member -MemberType NoteProperty -Name Risks -Value $Risks
                $tempObject | Add-Member -MemberType NoteProperty -Name Owner -value $Owner

                $global:ProjectArray += $tempObject
            }
        }

    }

}

function getMilestones(){
    $endRow = $global:Sheet.UsedRange.SpecialCells(11).Row
    $Mile= findTables("% done")
    
    #Read Milestones
    for($Row = $Mile; $Row -le $endRow; $Row++){
        [string]$Percent = escapeString($global:Sheet.Cells.Item($Row,1).Value())
        [string]$ID = escapeString($global:Sheet.Cells.Item($Row,2).Value())
        [string]$Project = escapeString($global:Sheet.Cells.Item($Row,3).Value())
    

        if ($Project -eq "" -OR $Project -eq $null){
            $Row = $endRow
        }
        Else{
            [string]$Name = escapeString($global:Sheet.Cells.Item($Row,4).Value())
            [string]$Status = escapeString($global:Sheet.Cells.Item($Row,5).Value())
            [string]$Deliverables = escapeString($global:Sheet.Cells.Item($Row,6).Value())
            if($global:Sheet.Cells.Item($Row,7).Value() -eq $null -or $global:Sheet.Cells.Item($Row,7).Value() -eq " "){
                $StartDate = ""
            }
            else{
                [string]$StartDate = escapeString($global:Sheet.Cells.Item($Row,7).Value().ToString('yyyy-MM-dd'))
            }

            if($global:Sheet.Cells.Item($Row,8).Value() -eq $null -or $global:Sheet.Cells.Item($Row,8).Value() -eq " "){
                $EndDate = ""
            }
            else{
                [string]$EndDate = escapeString($global:Sheet.Cells.Item($Row,8).Value().ToString('yyyy-MM-dd'))
            }

            if ($global:Sheet.Cells.Item($Row,9).Value() -eq $null -or $global:Sheet.Cells.Item($Row,9).Value() -eq " "){
                $CompletionDate = ""
            }
            else{
                [string]$CompletionDate = escapeString($global:Sheet.Cells.Item($Row,9).Value().ToString('yyyy-MM-dd'))
            }
            [string]$CurrentStatus = escapeString($global:Sheet.Cells.Item($Row,10).Value())
            [string]$NextSteps = escapeString($global:Sheet.Cells.Item($Row,11).Value())
            [string]$Resources = escapeString($global:Sheet.Cells.Item($Row,12).Value())   
        
        
            $global:ProjectArray | foreach-Object{
                if($_.Name -eq $Project){
                    $mProject = $_.ID
                }
            }

        
            $tempObject = New-Object -TypeName PSObject
            $tempObject | Add-Member -MemberType NoteProperty -Name ID -Value $ID
            $tempObject | Add-Member -MemberType NoteProperty -Name Project_ID -Value $mProject
            $tempObject | Add-Member -MemberType NoteProperty -Name Name -Value $Name
            $tempObject | Add-Member -MemberType NoteProperty -Name Status -Value $Status
            $tempObject | Add-Member -MemberType NoteProperty -Name Percent -Value $Percent
            $tempObject | Add-Member -MemberType NoteProperty -Name Start_Date -Value $StartDate
            $tempObject | Add-Member -MemberType NoteProperty -Name End_Date -Value $EndDate
            $tempObject | Add-Member -MemberType NoteProperty -Name Completion_Date -Value $CompletionDate
            $tempObject | Add-Member -MemberType NoteProperty -Name Deliverables -Value $Deliverables
            $tempObject | Add-Member -MemberType NoteProperty -Name Current_Status -Value $CurrentStatus
            $tempObject | Add-Member -MemberType NoteProperty -Name Next_Steps -Value $NextSteps
            $tempObject | Add-Member -MemberType NoteProperty -Name Resources -Value $Resources

            $global:MilestoneArray += $tempObject
        }
    }

}

function escapeString($string){
    #$string = $string -replace "'". "''"
    return $string -replace ' ', ' ' -replace "'". "''"
}

function writeDB(){

    $updatedProjects = @()
    $updatedMilestones = @()

    $err = $false

    $global:ProjectArray | foreach-object {
        if ($_.ID -ne $null){
            try{
                $updatedProjects += $_.ID
                $uri = $global:URIPath + 'project/'+ $_.ID
                $json = ConvertTo-JSON $_
                Invoke-RestMethod -Method Put -Uri $uri -Body (ConvertTo-Json $_) -ContentType 'application/json'
            }
            catch{
                "The following error occured:" + $_.ID
                $formatstring = "Project ID {0}  {1} : {2}`n{3}`n" +
                        "    + CategoryInfo          : {4}`n" +
                        "    + FullyQualifiedErrorId : {5}`n"
                $fields = $_.ID,
                          $_.InvocationInfo.MyCommand.Name,
                          $_.ErrorDetails.Message,
                          $_.InvocationInfo.PositionMessage,
                          $_.CategoryInfo.ToString(),
                          $_.FullyQualifiedErrorId

                LogWrite($formatstring -f $fields)
                Write-Host -Foreground Red ($formatstring -f $fields)
                $err = $true
            }
        }
    }


    $global:MilestoneArray | foreach-object {
        if (-not [string]::IsNullOrEmpty($_.ID)){
            try{
                $updatedMilestones += $_.ID
                $uri = $global:URIPath + 'milestone/'+ $_.ID
                Invoke-RestMethod -Method Put -Uri $uri -Body (ConvertTo-Json $_) -ContentType 'application/json'
            }
            catch{
                "The following error occured:"
                $formatstring = "Milestone ID {0}  {1} : {2}`n{3}`n" +
                        "    + CategoryInfo          : {4}`n" +
                        "    + FullyQualifiedErrorId : {5}`n"
                $fields = $_.ID,
                          $_.InvocationInfo.MyCommand.Name,
                          $_.ErrorDetails.Message,
                          $_.InvocationInfo.PositionMessage,
                          $_.CategoryInfo.ToString(),
                          $_.FullyQualifiedErrorId

                LogWrite($formatstring -f $fields)
                Write-Host -Foreground Red ($formatstring -f $fields)
                $err = $true
            }

        }
    }
    
    try{
        $tempObject = New-Object -TypeName PSObject 
        $tempObject | Add-Member -MemberType NoteProperty -Name IDs -Value $updatedMilestones
        $uri = $global:URIPath + 'milestones'
       Invoke-RestMethod -Method Delete -Uri $uri -Body (ConvertTo-Json $tempObject) -ContentType 'application/json'
    }
    catch{
        "The following error occured:"
        $formatstring = "Could not delete Milestones {0} : {1}`n{2}`n" +
                "    + CategoryInfo          : {3}`n" +
                "    + FullyQualifiedErrorId : {4}`n"
        $fields =   $_.InvocationInfo.MyCommand.Name,
                    $_.ErrorDetails.Message,
                    $_.InvocationInfo.PositionMessage,
                    $_.CategoryInfo.ToString(),
                    $_.FullyQualifiedErrorId

        LogWrite($formatstring -f $fields)
        Write-Host -Foreground Red ($formatstring -f $fields)
        $err = $true
    }

    try{
        $tempObject = New-Object -TypeName PSObject 
        $tempObject | Add-Member -MemberType NoteProperty -Name IDs -Value $updatedProjects
        $uri = $global:URIPath + 'projects'
        Invoke-RestMethod -Method Delete -Uri $uri -Body (ConvertTo-Json $tempObject) -ContentType 'application/json'
    }
    catch {
        "The following error occured:"
        $formatstring = "Could not delete Projects {0} : {1}`n{2}`n" +
                "    + CategoryInfo          : {3}`n" +
                "    + FullyQualifiedErrorId : {4}`n"
        $fields =   $_.InvocationInfo.MyCommand.Name,
                    $_.ErrorDetails.Message,
                    $_.InvocationInfo.PositionMessage,
                    $_.CategoryInfo.ToString(),
                    $_.FullyQualifiedErrorId
        LogWrite($formatstring -f $fields)
        Write-Host -Foreground Red ($formatstring -f $fields)
        $err = $true
    }
    
    try{
        $tempObject = New-Object -TypeName PSObject 
        $tempObject | Add-Member -MemberType NoteProperty -Name IDs -Value $updatedMilestones
        $uri = $global:URIPath + 'milestones'
       Invoke-RestMethod -Method Delete -Uri $uri -Body (ConvertTo-Json $tempObject) -ContentType 'application/json'
    }
    catch{
        "The following error occured:"
        $formatstring = "Could not delete Milestones {0} : {1}`n{2}`n" +
                "    + CategoryInfo          : {3}`n" +
                "    + FullyQualifiedErrorId : {4}`n"
        $fields =   $_.InvocationInfo.MyCommand.Name,
                    $_.ErrorDetails.Message,
                    $_.InvocationInfo.PositionMessage,
                    $_.CategoryInfo.ToString(),
                    $_.FullyQualifiedErrorId

        LogWrite($formatstring -f $fields)
        Write-Host -Foreground Red ($formatstring -f $fields)
        $err = $true
    }

    try{
        $tempObject = New-Object -TypeName PSObject 
        $tempObject | Add-Member -MemberType NoteProperty -Name IDs -Value $updatedProjects
        $uri = $global:URIPath + 'projects'
        Invoke-RestMethod -Method Delete -Uri $uri -Body (ConvertTo-Json $tempObject) -ContentType 'application/json'
    }
    catch {
        "The following error occured:"
        $formatstring = "Could not delete Projects {0} : {1}`n{2}`n" +
                "    + CategoryInfo          : {3}`n" +
                "    + FullyQualifiedErrorId : {4}`n"
        $fields =   $_.InvocationInfo.MyCommand.Name,
                    $_.ErrorDetails.Message,
                    $_.InvocationInfo.PositionMessage,
                    $_.CategoryInfo.ToString(),
                    $_.FullyQualifiedErrorId
        LogWrite($formatstring -f $fields)
        Write-Host -Foreground Red ($formatstring -f $fields)
        $err = $true

        
    }
}

function closeWorkbook(){
    
    $global:Workbook.Close($false)
    $global:Excel.Quit()

    while( [System.Runtime.Interopservices.Marshal]::ReleaseComObject($global:Excel)){}
}


LogWrite("$(Get-Date)---Starting")

$global:Excel = New-Object -ComObject Excel.Application
$global:Excel.DisplayAlerts = $false



try
{
    $global:Workbook = $global:Excel.Workbooks.Open($FilePath,$null,$true)
}

catch
{
    "Could not open workbook."
    Send-MailMessage -To "Tim Rexer <timothy_rexer@comcast.com>" -CC "Justin Bregenzer<Justin_Bregenzer@cable.comcast.com>","Nick Balog <Nicholas_Balog@cable.comcast.com>","Hany Fame <Hany_fame@cable.comcast.com>" -From "Automation_Scripting@comcast.com" -Subject "Automation KPI Update Failed" -Body "Automation script could not open the workbook.`n`nEnsure that the workbook is not corrupted and run the script again." -SmtpServer mailrelay.comcast.com
    
    $formatstring = "{0} : {1}`n{2}`n" +
                "    + CategoryInfo          : {3}`n" +
                "    + FullyQualifiedErrorId : {4}`n"
    $fields = $_.InvocationInfo.MyCommand.Name,
                $_.ErrorDetails.Message,
                $_.InvocationInfo.PositionMessage,
                $_.CategoryInfo.ToString(),
                $_.FullyQualifiedErrorId

    LogWrite("$(Get-Date)---" + $formatstring -f $fields)
    
    Write-Host -Foreground Red ($formatstring -f $fields)
    
    closeWorkbook
}

finally
{
    $LastSheetNum = $global:Workbook.Sheets.count

    $global:Sheet = $global:Workbook.Sheets.Item($LastSheetNum)

    $endRow = $global:Sheet.UsedRange.SpecialCells(11).Row

    #try{

        getProjects

        getMilestones

        $err = writeDB
        
        if ($err){
            #Send-MailMessage -To "Tim Rexer <timothy_rexer@comcast.com>" -CC "Justin Bregenzer<Justin_Bregenzer@cable.comcast.com>","Nick Balog <Nicholas_Balog@cable.comcast.com>","Hany Fame <Hany_fame@cable.comcast.com>" -From "Automation_Scripting@comcast.com" -Subject "Automation KPI Update Failed" -Body "Automation script received an error.  Consult the log for more details." -SmtpServer mailrelay.comcast.com
        }
        else{
            LogWrite("$(Get-Date)---Success")
        }
    #}

    <#catch{
        Send-MailMessage -To "Tim Rexer <timothy_rexer@comcast.com>" -CC "Justin Bregenzer<Justin_Bregenzer@cable.comcast.com>","Nick Balog <Nicholas_Balog@cable.comcast.com>","Hany Fame <Hany_fame@cable.comcast.com>" -From "Automation_Scripting@comcast.com" -Subject "Automation KPI Update Failed" -Body "Automation script received an error.  Consult the log for more details." -SmtpServer mailrelay.comcast.com
        "The following error occured:"
        $formatstring = "{0} : {1}`n{2}`n" +
                "    + CategoryInfo          : {3}`n" +
                "    + FullyQualifiedErrorId : {4}`n"
        $fields = $_.InvocationInfo.MyCommand.Name,
                  $_.ErrorDetails.Message,
                  $_.InvocationInfo.PositionMessage,
                  $_.CategoryInfo.ToString(),
                  $_.FullyQualifiedErrorId

        LogWrite($formatstring -f $fields)
        Write-Host -Foreground Red ($formatstring -f $fields)
    }

    finally{#>
        LogWrite("$(Get-Date)---Exiting")
        closeWorkbook
    #}
}