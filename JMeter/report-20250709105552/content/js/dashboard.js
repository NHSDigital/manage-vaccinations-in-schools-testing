/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 98.82974400650143, "KoPercent": 1.170255993498578};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6487673083417764, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "5.0 Consent for menacwy"], "isController": true}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9160899653979239, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [1.0, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [0.9459459459459459, 500, 1500, "2.5 Select menacwy"], "isController": false}, {"data": [0.4666136724960254, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.9242902208201893, 500, 1500, "2.5 Select td_ipv"], "isController": false}, {"data": [0.24733096085409254, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.21669793621013134, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.5, 500, 1500, "5.8 Consent confirm"], "isController": false}, {"data": [1.0, 500, 1500, "Select Organisations"], "isController": true}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "5.9 Patient home page"], "isController": false}, {"data": [0.41946308724832215, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Logout"], "isController": false}, {"data": [0.875, 500, 1500, "5.4 Consent route"], "isController": false}, {"data": [1.0, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.7642857142857142, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.21428571428571427, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.09715994020926756, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.4560731132075472, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [1.0, 500, 1500, "5.6 Consent questions"], "isController": false}, {"data": [0.8895513912549687, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "5.3 Consent parent details"], "isController": false}, {"data": [1.0, 500, 1500, "Homepage"], "isController": true}, {"data": [1.0, 500, 1500, "Sign In Page"], "isController": true}, {"data": [0.75, 500, 1500, "5.2 Consent who"], "isController": false}, {"data": [0.4357142857142857, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.22428571428571428, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.0, 500, 1500, "5.0 Consent for td_ipv"], "isController": true}, {"data": [1.0, 500, 1500, "Calculate site depending on vaccination"], "isController": false}, {"data": [1.0, 500, 1500, "Login"], "isController": true}, {"data": [1.0, 500, 1500, "Calculate slug from API"], "isController": true}, {"data": [0.9355140186915888, 500, 1500, "2.5 Select hpv"], "isController": false}, {"data": [0.9128919860627178, 500, 1500, "2.5 Select flu"], "isController": false}, {"data": [0.6, 500, 1500, "5.1 Consent start"], "isController": false}, {"data": [0.875, 500, 1500, "5.5 Consent agree"], "isController": false}, {"data": [0.9772727272727273, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.909902130109384, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for hpv"], "isController": true}, {"data": [0.875, 500, 1500, "5.7 Consent triage"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for flu"], "isController": true}, {"data": [1.0, 500, 1500, "Log name and address"], "isController": false}, {"data": [0.42538461538461536, 500, 1500, "2.2 Session register"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 12305, 144, 1.170255993498578, 934.7835839089811, 0, 47279, 421.0, 1426.0, 2426.8999999999924, 18585.42000000002, 3.4141814080411534, 76.38085525911916, 4.135340902666696], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["5.0 Consent for menacwy", 1, 0, 0.0, 5231.0, 5231, 5231, 5231.0, 5231.0, 5231.0, 5231.0, 0.19116803670426305, 43.69104407618046, 3.065409338558593], "isController": true}, {"data": ["2.0 Register attendance", 668, 73, 10.928143712574851, 9850.413173652696, 448, 84306, 4866.5, 27266.000000000015, 42348.99999999998, 70227.7899999999, 0.1905952105820287, 38.514461030430326, 0.770540666344966], "isController": true}, {"data": ["2.5 Select patient", 578, 4, 0.6920415224913494, 682.6332179930791, 156, 26865, 217.0, 556.0, 1358.6499999999994, 20884.210000000043, 0.16583538571359713, 4.695225285345173, 0.11498351939126362], "isController": false}, {"data": ["1.4 Select Organisations", 70, 0, 0.0, 241.24285714285713, 216, 371, 230.0, 271.8, 324.45000000000005, 371.0, 0.07912501299910928, 1.1368811682186473, 0.11436037035027512], "isController": false}, {"data": ["2.5 Select menacwy", 370, 1, 0.2702702702702703, 332.7945945945944, 158, 3650, 226.0, 483.7000000000001, 586.4999999999999, 2365.260000000002, 0.11333763403706815, 2.857231643189695, 0.0790264362328776], "isController": false}, {"data": ["2.3 Search by first/last name", 629, 13, 2.066772655007949, 1566.163751987281, 447, 36554, 713.0, 1567.0, 4335.5, 24500.30000000001, 0.17882160824592208, 10.553124883172488, 0.1542503505536078], "isController": false}, {"data": ["2.5 Select td_ipv", 317, 2, 0.6309148264984227, 528.9274447949526, 159, 29508, 228.0, 563.1999999999999, 846.3999999999995, 7912.2599999999675, 0.10001110533409388, 2.544274348937958, 0.06963663877266497], "isController": false}, {"data": ["4.0 Vaccination for flu", 562, 24, 4.270462633451957, 2174.989323843416, 514, 36469, 1495.5, 3242.7999999999993, 4978.900000000006, 18624.750000000004, 0.16351878458407745, 8.704620832271333, 0.978712298300161], "isController": true}, {"data": ["4.0 Vaccination for hpv", 533, 16, 3.0018761726078798, 2295.6622889305804, 703, 49711, 1530.0, 3069.2000000000003, 4600.699999999995, 23023.779999999915, 0.16056301284895722, 8.195365144729632, 0.9683809620691722], "isController": true}, {"data": ["5.8 Consent confirm", 4, 0, 0.0, 1127.0, 853, 1337, 1159.0, 1337.0, 1337.0, 1337.0, 0.006521615077974061, 0.6494213467746537, 0.014423659910001711], "isController": false}, {"data": ["Select Organisations", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["1.2 Sign-in page", 70, 0, 0.0, 94.18571428571428, 86, 123, 91.0, 114.6, 121.45, 123.0, 0.07900819879365767, 0.47613241675357565, 0.047605526030944124], "isController": false}, {"data": ["5.9 Patient home page", 4, 0, 0.0, 269.5, 188, 444, 223.0, 444.0, 444.0, 444.0, 0.00648684063292104, 0.1681431535248681, 0.004844542357447622], "isController": false}, {"data": ["2.4 Patient attending session", 596, 16, 2.684563758389262, 2209.4362416107388, 450, 40626, 905.0, 2428.600000000002, 7894.749999999961, 31172.469999999987, 0.1702006139787249, 9.013853285410866, 0.25125718390804597], "isController": false}, {"data": ["Logout", 1, 0, 0.0, 328.0, 328, 328, 328.0, 328.0, 328.0, 328.0, 3.048780487804878, 19.12037919207317, 6.445907964939024], "isController": false}, {"data": ["5.4 Consent route", 4, 0, 0.0, 638.25, 321, 1471, 380.5, 1471.0, 1471.0, 1471.0, 0.006568457282859118, 0.07742793529987471, 0.010473289676355689], "isController": false}, {"data": ["1.1 Homepage", 70, 0, 0.0, 279.3, 249, 498, 263.5, 331.7, 354.15000000000003, 498.0, 0.07890720287492757, 0.407250553900383, 0.042767087495688284], "isController": false}, {"data": ["1.3 Sign-in", 70, 0, 0.0, 557.3714285714285, 416, 1868, 494.0, 745.0999999999999, 913.3000000000002, 1868.0, 0.07905950809174066, 0.7672014960035419, 0.12437975345292401], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 308, 12, 3.896103896103896, 2378.1590909090905, 620, 45338, 1533.5, 3333.4, 4597.400000000001, 31322.530000000144, 0.09860016576352544, 5.470150508010944, 0.5947053841853017], "isController": true}, {"data": ["2.1 Open session", 669, 19, 2.8400597907324365, 3850.8340807174886, 449, 35856, 1933.0, 6840.0, 20964.5, 30307.099999999995, 0.18994366140398747, 3.258960499952159, 0.12417834150010632], "isController": false}, {"data": ["4.3 Vaccination confirm", 1696, 31, 1.8278301886792452, 1117.9139150943377, 449, 47279, 800.0, 1435.6, 2226.5999999999995, 6797.659999999956, 0.4993696047619131, 10.339964569159745, 1.1550791746312585], "isController": false}, {"data": ["5.6 Consent questions", 4, 0, 0.0, 348.5, 269, 491, 317.0, 491.0, 491.0, 491.0, 0.006568791670772161, 0.08044364233339901, 0.01643961997487437], "isController": false}, {"data": ["4.1 Vaccination questions", 1761, 18, 1.0221465076660987, 585.610448608745, 237, 26047, 413.0, 595.0, 1219.7999999999997, 4457.579999999989, 0.511110633829429, 6.073522528195254, 1.101772224786805], "isController": false}, {"data": ["5.3 Consent parent details", 4, 0, 0.0, 325.5, 269, 456, 288.5, 456.0, 456.0, 456.0, 0.0065709822139938924, 0.07427648352244073, 0.012126478162983357], "isController": false}, {"data": ["Homepage", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Sign In Page", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["5.2 Consent who", 4, 0, 0.0, 530.75, 328, 849, 473.0, 849.0, 849.0, 849.0, 0.006626685663165568, 0.14055012621765348, 0.01057260517792651], "isController": false}, {"data": ["1.0 Login", 70, 0, 0.0, 1343.3857142857144, 1146, 2632, 1286.5, 1575.5, 1755.9, 2632.0, 0.07879652935058151, 3.641338442772332, 0.3751299615078954], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 350, 10, 2.857142857142857, 2007.6057142857144, 541, 27962, 1534.5, 2912.000000000001, 3764.249999999999, 18582.63000000015, 0.10858841268560862, 5.56800386914088, 0.6416611709941735], "isController": true}, {"data": ["5.0 Consent for td_ipv", 1, 0, 0.0, 4487.0, 4487, 4487, 4487.0, 4487.0, 4487.0, 4487.0, 0.22286605749944285, 51.01173354969913, 3.5730391269222195], "isController": true}, {"data": ["Calculate site depending on vaccination", 1786, 0, 0.0, 0.21332586786114216, 0, 27, 0.0, 1.0, 1.0, 1.0, 0.5127887092310006, 0.0, 0.0], "isController": false}, {"data": ["Login", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Calculate slug from API", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["2.5 Select hpv", 535, 1, 0.18691588785046728, 407.343925233645, 158, 16077, 237.0, 505.60000000000014, 685.0, 3110.5999999999985, 0.1597583378921694, 3.826799505040301, 0.11903868340988794], "isController": false}, {"data": ["2.5 Select flu", 574, 5, 0.8710801393728222, 718.0662020905924, 153, 25350, 249.0, 542.5, 654.5, 23817.25, 0.16479317308393485, 3.8840499560527615, 0.11426089149374388], "isController": false}, {"data": ["5.1 Consent start", 5, 0, 0.0, 591.8, 462, 688, 587.0, 688.0, 688.0, 688.0, 0.003042513651758755, 0.03957882407455862, 0.006566956712028517], "isController": false}, {"data": ["5.5 Consent agree", 4, 0, 0.0, 410.0, 363, 528, 374.5, 528.0, 528.0, 528.0, 0.006570885065363879, 0.11120773791532101, 0.010355240013897423], "isController": false}, {"data": ["1.5 Open Sessions list", 88, 0, 0.0, 558.9886363636363, 134, 29539, 145.0, 275.20000000000005, 392.4999999999998, 29539.0, 0.02635528299134858, 0.28864697143356866, 0.016030418376640355], "isController": false}, {"data": ["4.2 Vaccination batch", 1737, 13, 0.7484168105929764, 551.1542890040298, 227, 30810, 292.0, 552.2, 1225.4999999999995, 3831.459999999991, 0.5051653667698325, 10.541868356253842, 0.8159803461735105], "isController": false}, {"data": ["5.0 Consent for hpv", 1, 0, 0.0, 4753.0, 4753, 4753, 4753.0, 4753.0, 4753.0, 4753.0, 0.21039343572480537, 47.49529080317694, 3.371226067746686], "isController": true}, {"data": ["5.7 Consent triage", 4, 0, 0.0, 475.0, 365, 738, 398.5, 738.0, 738.0, 738.0, 0.006543314286835997, 0.10660043026381007, 0.011048232814393983], "isController": false}, {"data": ["5.0 Consent for flu", 1, 0, 0.0, 4399.0, 4399, 4399, 4399.0, 4399.0, 4399.0, 4399.0, 0.22732439190725165, 51.86814474880655, 3.5506116446919753], "isController": true}, {"data": ["Log name and address", 1, 0, 0.0, 75.0, 75, 75, 75.0, 75.0, 75.0, 75.0, 13.333333333333334, 0.0, 0.0], "isController": false}, {"data": ["2.2 Session register", 650, 21, 3.230769230769231, 1958.1876923076932, 448, 33900, 781.5, 2681.8, 7356.09999999999, 27432.600000000013, 0.1845863051728466, 10.894478689493319, 0.12226901455477215], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["502/Bad Gateway", 18, 12.5, 0.14628199918732224], "isController": false}, {"data": ["500/Internal Server Error", 126, 87.5, 1.0239739943112556], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 12305, 144, "500/Internal Server Error", 126, "502/Bad Gateway", 18, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.5 Select patient", 578, 4, "500/Internal Server Error", 4, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["2.5 Select menacwy", 370, 1, "500/Internal Server Error", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["2.3 Search by first/last name", 629, 13, "500/Internal Server Error", 12, "502/Bad Gateway", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["2.5 Select td_ipv", 317, 2, "500/Internal Server Error", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 596, 16, "500/Internal Server Error", 11, "502/Bad Gateway", 5, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.1 Open session", 669, 19, "500/Internal Server Error", 12, "502/Bad Gateway", 7, "", "", "", "", "", ""], "isController": false}, {"data": ["4.3 Vaccination confirm", 1696, 31, "500/Internal Server Error", 30, "502/Bad Gateway", 1, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["4.1 Vaccination questions", 1761, 18, "500/Internal Server Error", 18, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.5 Select hpv", 535, 1, "500/Internal Server Error", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["2.5 Select flu", 574, 5, "500/Internal Server Error", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.2 Vaccination batch", 1737, 13, "500/Internal Server Error", 13, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.2 Session register", 650, 21, "500/Internal Server Error", 17, "502/Bad Gateway", 4, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
