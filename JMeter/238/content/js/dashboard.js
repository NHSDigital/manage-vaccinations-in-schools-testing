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

    var data = {"OkPercent": 99.90787655458314, "KoPercent": 0.09212344541685859};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8109696175579396, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9629629629629629, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.369969040247678, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.994727047146402, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.6296296296296297, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.9941358024691358, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.4632352941176471, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.479064039408867, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.3333333333333333, 500, 1500, "7.6 First name search"], "isController": false}, {"data": [0.9839588377723971, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.47927807486631013, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.9851963746223565, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9793939393939394, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.47551546391752575, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.95, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.5185185185185185, 500, 1500, "7.7 Partial name search"], "isController": false}, {"data": [0.5606936416184971, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9943644333124608, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.4074074074074074, 500, 1500, "7.7 Last name search"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.49727272727272726, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.480719794344473, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.5555555555555556, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 year group"], "isController": false}, {"data": [0.0, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [0.936806411837238, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9924575738529227, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9935185185185185, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.9444444444444444, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 19539, 18, 0.09212344541685859, 276.1842980705263, 2, 24807, 124.0, 654.0, 848.0, 1616.9999999999927, 5.198479539849822, 2249.002787715915, 25.21923363682186], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 27, 0, 0.0, 201.66666666666666, 88, 2466, 104.0, 238.6, 1582.3999999999953, 2466.0, 0.007837745887505704, 3.368110560132493, 0.03445115676420693], "isController": false}, {"data": ["2.0 Register attendance", 1615, 18, 1.1145510835913313, 1354.0241486068112, 346, 4685, 1254.0, 1958.4000000000005, 2304.7999999999993, 2925.5199999999995, 0.4535248003648418, 985.9033779739046, 9.800943912970556], "isController": true}, {"data": ["2.5 Select patient", 1612, 0, 0.0, 107.91811414392086, 58, 1343, 85.0, 162.70000000000005, 246.69999999999982, 504.8699999999999, 0.4540765766907733, 191.43465619403267, 1.8955646606488845], "isController": false}, {"data": ["7.1 Full name search", 27, 0, 0.0, 732.9629629629628, 299, 1687, 650.0, 1312.6, 1606.9999999999995, 1687.0, 0.007782818994690387, 3.342490493971198, 0.03379958259228406], "isController": false}, {"data": ["2.3 Search by first/last name", 1620, 0, 0.0, 104.53641975308658, 58, 1364, 82.0, 153.0, 223.94999999999982, 516.3699999999999, 0.4535921982141907, 192.99740767115057, 1.9678384188041966], "isController": false}, {"data": ["4.0 Vaccination for flu", 408, 0, 0.0, 996.4705882352946, 170, 4687, 863.5, 1448.2000000000007, 1838.4999999999995, 3022.3599999999874, 0.11667546975460118, 143.71283577754264, 1.968121073105475], "isController": true}, {"data": ["4.0 Vaccination for hpv", 406, 0, 0.0, 964.583743842364, 194, 4691, 862.0, 1325.0, 1571.1999999999998, 2432.0, 0.11611555156173986, 142.90326859781106, 1.9631056352829117], "isController": true}, {"data": ["7.6 First name search", 27, 0, 0.0, 1739.7037037037035, 600, 9408, 1002.0, 3594.1999999999985, 7749.999999999991, 9408.0, 0.00784425151459423, 4.053112671179, 0.03400565877404227], "isController": false}, {"data": ["1.2 Sign-in page", 1652, 0, 0.0, 145.49757869249405, 12, 4930, 99.0, 228.70000000000005, 361.0, 881.9400000000028, 0.4597679396468303, 192.6119563938149, 2.2940956561009562], "isController": false}, {"data": ["2.4 Patient attending session", 1496, 18, 1.2032085561497325, 798.4525401069513, 30, 4045, 688.0, 1203.0, 1452.9999999999973, 2011.6699999999976, 0.42055395614488084, 215.55945113096615, 2.1486366442282203], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 28.0, 28, 28, 28.0, 28.0, 28.0, 28.0, 35.714285714285715, 11.160714285714285, 21.065848214285715], "isController": false}, {"data": ["1.1 Homepage", 1655, 0, 0.0, 147.17583081570984, 23, 4977, 104.0, 218.0, 328.1999999999989, 871.7200000000007, 0.4597438046397178, 192.40131407384123, 2.2855424063657432], "isController": false}, {"data": ["1.3 Sign-in", 1650, 0, 0.0, 167.04969696969687, 65, 5305, 105.0, 320.9000000000001, 451.34999999999945, 899.3100000000002, 0.45926487558932033, 192.59859523139016, 2.4041428962300757], "isController": false}, {"data": ["Run some searches", 27, 0, 0.0, 10913.592592592593, 6587, 52492, 8303.0, 15174.0, 37612.799999999916, 52492.0, 0.007762961702147235, 30.966145654383887, 0.2714108076851308], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 388, 0, 0.0, 982.7268041237114, 167, 3659, 876.0, 1420.2, 1779.8999999999992, 2704.6500000000015, 0.11190908828704103, 138.05842328603157, 1.8868688213853078], "isController": true}, {"data": ["2.1 Open session", 1620, 0, 0.0, 282.9308641975309, 78, 1853, 221.0, 492.60000000000036, 651.8499999999995, 1249.79, 0.4534137013783776, 190.40037309938842, 1.89619901474882], "isController": false}, {"data": ["7.7 Partial name search", 27, 0, 0.0, 1210.111111111111, 235, 6603, 785.0, 2612.0, 5083.399999999992, 6603.0, 0.007890528560206486, 4.060337056804354, 0.03419856905995165], "isController": false}, {"data": ["4.3 Vaccination confirm", 1557, 0, 0.0, 730.626204238921, 433, 5750, 616.0, 1067.2, 1379.6999999999994, 2193.0800000000017, 0.4499919365606743, 188.45290216936505, 2.7247815460929603], "isController": false}, {"data": ["4.1 Vaccination questions", 1597, 0, 0.0, 134.14214151534136, 74, 1187, 106.0, 200.0, 276.1999999999998, 518.1599999999999, 0.4546271047142582, 186.27466651619778, 2.605721540916155], "isController": false}, {"data": ["7.7 Last name search", 27, 0, 0.0, 1613.5555555555557, 359, 11224, 910.0, 3318.0, 8112.799999999984, 11224.0, 0.007866880723519935, 4.066271652587621, 0.034139894991710634], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 35.0, 35, 35, 35.0, 35.0, 35.0, 35.0, 28.57142857142857, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1650, 0, 0.0, 804.6454545454552, 411, 15212, 678.0, 1161.6000000000004, 1409.4499999999998, 2294.92, 0.45945900790269495, 793.3511979566953, 8.866738700789156], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 389, 0, 0.0, 968.529562982005, 177, 5933, 878.0, 1370.0, 1593.5, 2356.9000000000096, 0.11162805646370925, 137.5002335486179, 1.8841160633526526], "isController": true}, {"data": ["7.0 Open Children Search", 27, 0, 0.0, 1018.1111111111114, 224, 5019, 637.0, 2675.0, 4180.599999999996, 5019.0, 0.00778027803255787, 3.9654823192461315, 0.032473824677341785], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 43.0, 43, 43, 43.0, 43.0, 43.0, 43.0, 23.25581395348837, 6.6542514534883725, 14.353197674418606], "isController": false}, {"data": ["7.5 year group", 27, 0, 0.0, 1856.8888888888887, 1544, 3364, 1739.0, 2390.1999999999994, 3291.5999999999995, 3364.0, 0.007838282870274677, 4.052989300635017, 0.034644881423472815], "isController": false}, {"data": ["7.2 No Consent search", 27, 0, 0.0, 3143.296296296297, 1949, 24807, 2140.0, 3960.999999999999, 16777.399999999958, 24807.0, 0.007780383405767743, 4.295767263410067, 0.0343357820048953], "isController": false}, {"data": ["1.4 Open Sessions list", 1622, 0, 0.0, 350.63933415536394, 209, 3065, 301.5, 549.7, 656.8499999999999, 946.8499999999999, 0.45232553048554164, 216.22220495170964, 1.8878021136109548], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 142.578125, 307.12890625], "isController": false}, {"data": ["4.2 Vaccination batch", 1591, 0, 0.0, 128.9107479572595, 68, 1893, 96.0, 200.79999999999995, 292.0, 546.5599999999995, 0.45406624743785057, 187.24667469963418, 2.37084134332046], "isController": false}, {"data": ["2.2 Session register", 1620, 0, 0.0, 118.9759259259261, 57, 1548, 81.0, 233.80000000000018, 324.9499999999998, 529.0599999999995, 0.45357937121019737, 196.32352007349456, 1.900878391800741], "isController": false}, {"data": ["7.3 Due vaccination", 27, 0, 0.0, 415.40740740740745, 302, 1076, 351.0, 854.4, 1021.5999999999997, 1076.0, 0.007838933719202426, 4.016585090192013, 0.034349205008730246], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 18, 100.0, 0.09212344541685859], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 19539, 18, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 18, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 1496, 18, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 18, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
