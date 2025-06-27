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

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.49962852897473997, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.7222222222222222, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.7714285714285715, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [0.7564102564102564, 500, 1500, "2.5 Select menacwy"], "isController": false}, {"data": [0.20666666666666667, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.90625, 500, 1500, "2.5 Select td_ipv"], "isController": false}, {"data": [0.07746478873239436, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.5, 500, 1500, "5.8 Consent confirm"], "isController": false}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "5.9 Patient home page"], "isController": false}, {"data": [0.22916666666666666, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "5.4 Consent route"], "isController": false}, {"data": [0.9857142857142858, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.7714285714285715, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.08620689655172414, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.26973684210526316, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [1.0, 500, 1500, "5.6 Consent questions"], "isController": false}, {"data": [0.4396551724137931, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.631578947368421, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "5.3 Consent parent details"], "isController": false}, {"data": [0.875, 500, 1500, "5.2 Consent who"], "isController": false}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.7361111111111112, 500, 1500, "2.5 Select hpv"], "isController": false}, {"data": [0.5, 500, 1500, "5.1 Consent start"], "isController": false}, {"data": [1.0, 500, 1500, "5.5 Consent agree"], "isController": false}, {"data": [0.7777777777777778, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.8598484848484849, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for hpv"], "isController": true}, {"data": [0.8333333333333334, 500, 1500, "5.7 Consent triage"], "isController": false}, {"data": [0.27631578947368424, 500, 1500, "2.2 Session register"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1103, 0, 0.0, 994.4252039891215, 87, 4844, 651.0, 2042.6000000000008, 2770.2, 4041.680000000002, 1.8378708025147004, 65.52875111065799, 2.3124811766122195], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["2.0 Register attendance", 73, 0, 0.0, 8299.260273972606, 3771, 15608, 8294.0, 11195.0, 12985.0, 15608.0, 0.15152458642090624, 55.69710512472238, 0.6513923429489176], "isController": true}, {"data": ["2.5 Select patient", 72, 0, 0.0, 694.9444444444445, 363, 2085, 561.5, 1203.3000000000002, 1518.7499999999993, 2085.0, 0.16710454245847917, 4.102769184819945, 0.11586350111867208], "isController": false}, {"data": ["1.4 Select Organisations", 35, 0, 0.0, 673.7428571428574, 409, 2670, 444.0, 1709.3999999999999, 2029.1999999999966, 2670.0, 0.5731315910132966, 8.235408427900046, 0.8283542526364054], "isController": false}, {"data": ["2.5 Select menacwy", 39, 0, 0.0, 557.3846153846155, 370, 1885, 455.0, 733.0, 788.0, 1885.0, 0.10378385282917443, 2.3468882557260744, 0.07236491300784233], "isController": false}, {"data": ["2.3 Search by first/last name", 75, 0, 0.0, 2096.253333333334, 793, 4720, 1660.0, 4103.600000000001, 4698.2, 4720.0, 0.14357749164378997, 17.111660798534935, 0.12386362902160554], "isController": false}, {"data": ["2.5 Select td_ipv", 32, 0, 0.0, 471.28125000000006, 371, 1169, 424.0, 640.5, 837.4999999999989, 1169.0, 0.12646371874468954, 2.9009082046301526, 0.08805530416500354], "isController": false}, {"data": ["4.0 Vaccination for hpv", 71, 0, 0.0, 2046.788732394366, 924, 3858, 2131.0, 2350.4, 2506.1999999999994, 3858.0, 0.1652938738831023, 7.810776673134856, 0.9107191367527436], "isController": true}, {"data": ["5.8 Consent confirm", 3, 0, 0.0, 1162.0, 983, 1283, 1220.0, 1283.0, 1283.0, 1283.0, 0.014206967096664204, 1.0836882115322688, 0.030869630654372905], "isController": false}, {"data": ["1.2 Sign-in page", 35, 0, 0.0, 89.91428571428573, 87, 96, 90.0, 94.0, 95.19999999999999, 96.0, 0.5986897247737808, 3.6079241128701187, 0.3607339454935769], "isController": false}, {"data": ["5.9 Patient home page", 3, 0, 0.0, 411.0, 401, 428, 404.0, 428.0, 428.0, 428.0, 0.014314957699299998, 0.30950038262689017, 0.010666321020083885], "isController": false}, {"data": ["2.4 Patient attending session", 72, 0, 0.0, 2121.291666666668, 964, 4844, 1703.5, 3753.4, 3948.95, 4844.0, 0.1667272596753913, 16.65914636149596, 0.24781141525971243], "isController": false}, {"data": ["5.4 Consent route", 4, 0, 0.0, 452.75, 440, 468, 451.5, 468.0, 468.0, 468.0, 0.0096610189959786, 0.10986342866545099, 0.015029300059173741], "isController": false}, {"data": ["1.1 Homepage", 35, 0, 0.0, 273.1142857142858, 254, 504, 263.0, 290.99999999999994, 353.5999999999992, 504.0, 0.6025133413668445, 3.109651376097435, 0.3265575238853503], "isController": false}, {"data": ["1.3 Sign-in", 35, 0, 0.0, 651.1428571428571, 452, 1995, 467.0, 1342.1999999999996, 1949.3999999999999, 1995.0, 0.5972798170617246, 5.796064005998396, 0.9396658059437875], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 29, 0, 0.0, 2402.6551724137926, 918, 4330, 2262.0, 4085.0, 4307.5, 4330.0, 0.13949148139953246, 7.176882751697948, 0.7706791611751916], "isController": true}, {"data": ["2.1 Open session", 76, 0, 0.0, 1726.1973684210525, 1055, 4534, 1419.5, 2916.4, 3151.599999999998, 4534.0, 0.14099897775741127, 2.4747780976408644, 0.0895828337686986], "isController": false}, {"data": ["5.6 Consent questions", 3, 0, 0.0, 450.3333333333333, 450, 451, 450.0, 451.0, 451.0, 451.0, 0.014398502555734204, 0.1754817498980106, 0.035475997996208396], "isController": false}, {"data": ["4.3 Vaccination confirm", 116, 0, 0.0, 1269.439655172414, 924, 3334, 1126.5, 1626.2999999999997, 2753.35, 3313.43, 0.28993911278631485, 5.823249773797502, 0.6749168612091461], "isController": false}, {"data": ["4.1 Vaccination questions", 133, 0, 0.0, 618.1278195488728, 452, 1888, 623.0, 693.6000000000003, 880.3999999999996, 1838.0199999999995, 0.30132765417554036, 3.495028642411301, 0.5916281039014002], "isController": false}, {"data": ["5.3 Consent parent details", 4, 0, 0.0, 455.75, 436, 500, 443.5, 500.0, 500.0, 500.0, 0.009617696561673479, 0.10873209831089205, 0.017403898172637655], "isController": false}, {"data": ["5.2 Consent who", 4, 0, 0.0, 495.25, 461, 543, 488.5, 543.0, 543.0, 543.0, 0.009519185919220187, 0.18342560250497378, 0.014975984878773167], "isController": false}, {"data": ["1.0 Login", 35, 0, 0.0, 2302.9142857142847, 1554, 4289, 2037.0, 3443.3999999999996, 3969.7999999999984, 4289.0, 0.5685325363048634, 26.258541313025894, 2.7066368305529385], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 32, 0, 0.0, 2647.53125, 2055, 4381, 2277.0, 4072.9, 4327.7, 4381.0, 0.12483225665511967, 6.503997527492354, 0.7399648397270855], "isController": true}, {"data": ["2.5 Select hpv", 72, 0, 0.0, 625.3055555555557, 363, 2183, 449.5, 1095.4, 1664.1999999999991, 2183.0, 0.16764264176862986, 3.369838112797886, 0.12491341373971152], "isController": false}, {"data": ["5.1 Consent start", 4, 0, 0.0, 782.25, 585, 973, 785.5, 973.0, 973.0, 973.0, 0.009474654115908181, 0.10823450701598138, 0.02014289258821495], "isController": false}, {"data": ["5.5 Consent agree", 4, 0, 0.0, 485.25, 465, 499, 488.5, 499.0, 499.0, 499.0, 0.009569835877314704, 0.15083472519618163, 0.014709884444231781], "isController": false}, {"data": ["1.5 Open Sessions list", 36, 0, 0.0, 606.8888888888888, 323, 1828, 403.0, 1522.3000000000002, 1681.7999999999997, 1828.0, 0.06912548579855297, 0.7552499366349713, 0.04141266150881734], "isController": false}, {"data": ["4.2 Vaccination batch", 132, 0, 0.0, 537.0606060606061, 449, 1989, 476.5, 635.5, 723.0999999999999, 1817.7299999999937, 0.30510496072929333, 6.133346018351371, 0.4898206793265964], "isController": false}, {"data": ["5.0 Consent for hpv", 3, 0, 0.0, 5329.0, 5284, 5392, 5311.0, 5392.0, 5392.0, 5392.0, 0.013379656678009642, 2.6113065485614637, 0.20912246594877376], "isController": true}, {"data": ["5.7 Consent triage", 3, 0, 0.0, 565.6666666666666, 481, 733, 483.0, 733.0, 733.0, 733.0, 0.01433582139477985, 0.22929847658004646, 0.02358970610371489], "isController": false}, {"data": ["2.2 Session register", 76, 0, 0.0, 1632.8421052631575, 819, 3620, 1360.5, 2897.0, 3400.449999999999, 3620.0, 0.14089624845199517, 15.24156175148868, 0.0907559112696606], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1103, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
