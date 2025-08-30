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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8315946348733234, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.23484848484848486, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [1.0, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [1.0, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [1.0, 500, 1500, "2.5 Select menacwy"], "isController": false}, {"data": [1.0, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [1.0, 500, 1500, "2.5 Select td_ipv"], "isController": false}, {"data": [0.4880952380952381, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.5, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [1.0, 500, 1500, "Select Organisations"], "isController": true}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.9769230769230769, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Logout"], "isController": false}, {"data": [1.0, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.5, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.971830985915493, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.5182481751824818, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.986013986013986, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Homepage"], "isController": true}, {"data": [1.0, 500, 1500, "Sign In Page"], "isController": true}, {"data": [0.5, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.5, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [1.0, 500, 1500, "Login"], "isController": true}, {"data": [1.0, 500, 1500, "Calculate slug from API"], "isController": true}, {"data": [0.9880952380952381, 500, 1500, "2.5 Select hpv"], "isController": false}, {"data": [0.9910714285714286, 500, 1500, "2.5 Select flu"], "isController": false}, {"data": [1.0, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [1.0, 500, 1500, "Log name and address"], "isController": false}, {"data": [0.8380281690140845, 500, 1500, "2.2 Session register"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1096, 0, 0.0, 321.5611313868613, 85, 1528, 250.0, 551.3000000000001, 734.5999999999995, 927.4899999999977, 1.8200961196746412, 40.73249345902957, 2.32104809969344], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["2.0 Register attendance", 66, 0, 0.0, 1467.8181818181818, 815, 2343, 1525.5, 1957.6000000000001, 2107.45, 2343.0, 0.13061263261634914, 23.15791892888736, 0.559173737807014], "isController": true}, {"data": ["2.5 Select patient", 64, 0, 0.0, 176.53124999999991, 158, 279, 169.0, 204.0, 216.5, 279.0, 0.12771952791669494, 3.2593171489159802, 0.08855553205161465], "isController": false}, {"data": ["1.4 Select Organisations", 35, 0, 0.0, 208.77142857142854, 194, 300, 200.0, 244.4, 289.59999999999997, 300.0, 0.6053478155591684, 8.695963248901727, 0.8749167646753606], "isController": false}, {"data": ["2.5 Select menacwy", 30, 0, 0.0, 241.36666666666667, 162, 457, 182.0, 413.9, 435.54999999999995, 457.0, 0.10223938329203999, 2.3678900762620603, 0.07128800749073883], "isController": false}, {"data": ["2.3 Search by first/last name", 71, 0, 0.0, 206.2957746478873, 140, 414, 155.0, 389.0, 403.79999999999995, 414.0, 0.13684320082028825, 3.605761122846647, 0.1180758213724024], "isController": false}, {"data": ["2.5 Select td_ipv", 28, 0, 0.0, 205.35714285714286, 161, 412, 173.0, 406.4, 411.1, 412.0, 0.362004990497369, 8.501928100798997, 0.25206011545373447], "isController": false}, {"data": ["4.0 Vaccination for flu", 42, 0, 0.0, 1255.880952380952, 1124, 1721, 1222.0, 1399.4, 1476.8, 1721.0, 0.13429385413768957, 7.047367260916971, 0.7836993140621652], "isController": true}, {"data": ["4.0 Vaccination for hpv", 42, 0, 0.0, 1240.2619047619048, 466, 2162, 1255.0, 1461.5000000000002, 1523.9, 2162.0, 0.13570932355364557, 6.797056122469586, 0.7812121346753477], "isController": true}, {"data": ["Select Organisations", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["1.2 Sign-in page", 35, 0, 0.0, 89.31428571428572, 85, 108, 88.0, 93.8, 98.39999999999995, 108.0, 0.605243134813585, 3.647417368100228, 0.36468263103513865], "isController": false}, {"data": ["2.4 Patient attending session", 65, 0, 0.0, 367.9076923076924, 325, 567, 346.0, 444.19999999999993, 519.4999999999998, 567.0, 0.12937305816015587, 3.46763917990916, 0.19229081496070044], "isController": false}, {"data": ["Logout", 1, 0, 0.0, 301.0, 301, 301, 301.0, 301.0, 301.0, 301.0, 3.3222591362126246, 20.835496262458474, 7.024112333887043], "isController": false}, {"data": ["1.1 Homepage", 35, 0, 0.0, 262.11428571428576, 253, 290, 261.0, 273.8, 285.2, 290.0, 0.6001165940811358, 3.097281445037893, 0.3252585055810843], "isController": false}, {"data": ["1.3 Sign-in", 35, 0, 0.0, 473.2285714285714, 405, 732, 470.0, 546.4, 624.7999999999994, 732.0, 0.5972288580984234, 5.795569495043001, 0.9395856351528906], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 28, 0, 0.0, 1224.8928571428573, 1135, 1387, 1221.5, 1296.1, 1350.5499999999997, 1387.0, 0.35681971683806757, 20.060443806469905, 2.115431178397115], "isController": true}, {"data": ["2.1 Open session", 71, 0, 0.0, 280.15492957746494, 138, 662, 207.0, 458.0, 506.0, 662.0, 0.1363182551263344, 2.3299970510377466, 0.08638014433415252], "isController": false}, {"data": ["4.3 Vaccination confirm", 137, 0, 0.0, 643.8978102189777, 492, 1528, 583.0, 794.6, 823.2, 1356.6200000000022, 0.34507859983728406, 7.266948758976451, 0.8031155386752508], "isController": false}, {"data": ["4.1 Vaccination questions", 143, 0, 0.0, 344.44055944055947, 231, 536, 395.0, 433.2, 481.19999999999976, 531.1600000000001, 0.3146120811039144, 3.6552942695499504, 0.6179788085112468], "isController": false}, {"data": ["Homepage", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Sign In Page", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["1.0 Login", 35, 0, 0.0, 1157.0285714285717, 1063, 1388, 1141.0, 1264.2, 1355.9999999999998, 1388.0, 0.5910464900282014, 27.309349247260077, 2.8138199598510565], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 28, 0, 0.0, 1227.8571428571431, 1126, 1310, 1237.0, 1298.6, 1307.3, 1310.0, 0.4440849471063108, 23.4538403187499, 2.6339974286688554], "isController": true}, {"data": ["Login", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Calculate slug from API", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["2.5 Select hpv", 42, 0, 0.0, 299.57142857142856, 159, 508, 326.5, 440.1, 463.15000000000003, 508.0, 0.1358366079658468, 2.9769561633839485, 0.10121419128705186], "isController": false}, {"data": ["2.5 Select flu", 56, 0, 0.0, 200.75, 158, 505, 167.5, 396.5, 401.9, 505.0, 0.11379777728555723, 2.4134340720959724, 0.07890275573510316], "isController": false}, {"data": ["1.5 Open Sessions list", 36, 0, 0.0, 123.3611111111111, 111, 331, 117.0, 124.0, 165.24999999999972, 331.0, 0.11798597933278929, 1.291739076464747, 0.07068468841049945], "isController": false}, {"data": ["4.2 Vaccination batch", 140, 0, 0.0, 263.88571428571424, 226, 427, 241.0, 392.8, 401.95, 420.85, 0.33419428145842384, 6.8008373095987755, 0.5374359697184175], "isController": false}, {"data": ["Log name and address", 1, 0, 0.0, 105.0, 105, 105, 105.0, 105.0, 105.0, 105.0, 9.523809523809526, 0.0, 0.0], "isController": false}, {"data": ["2.2 Session register", 71, 0, 0.0, 428.6760563380282, 139, 1233, 421.0, 918.1999999999999, 1083.9999999999986, 1233.0, 0.13651247166404856, 10.723891704391855, 0.08770302925500721], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1096, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
