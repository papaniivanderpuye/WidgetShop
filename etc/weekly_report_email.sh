#Command to Mail Weekly Reports
curl "http://127.0.0.1:5000/v1/download/leadership/report" >> Leadership_Report.xlsx;
(uuencode Leadership_Report.xlsx "Leadership Report $(date +'%m-%d-%Y %H %M %S').xlsx";
echo "This is the Weekly Leadership Report for $(date +'%m-%d-%Y %I:%M:%S%p')" )|
mail -s 'Leadership Report'  papaniivanderpuye@gmail.com;
rm -f -- Leadership_Report.xlsx