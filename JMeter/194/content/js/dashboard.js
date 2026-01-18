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

    var data = {"OkPercent": 99.79858131184868, "KoPercent": 0.20141868815132674};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6852304594808369, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.20051085568326948, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9197761194029851, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.05143540669856459, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.2832744405182568, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.065, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.9530120481927711, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.9553571428571429, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.07881773399014778, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.06930693069306931, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.9272300469483568, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.3044077134986226, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.5100117785630153, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9371108343711083, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [1.0, 500, 1500, "Add vaccination row to STS"], "isController": false}, {"data": [0.9284876905041032, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9181389870435807, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.9472123368920522, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0707070707070707, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.5, 500, 1500, "Data prep Homepage"], "isController": false}, {"data": [0.7024793388429752, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 11419, 23, 0.20141868815132674, 504.4975917330789, 0, 18308, 179.0, 1331.0, 1848.0, 3334.5999999999985, 5.9102811148946435, 2093.6062458504393, 25.074305924333494], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 783, 0, 0.0, 1985.4431673052359, 955, 18308, 1674.0, 3061.8, 3631.7999999999984, 8007.959999999988, 0.4709658288126428, 190.21154203396338, 2.816405519284938], "isController": false}, {"data": ["4.1 Vaccination questions", 804, 0, 0.0, 321.2835820895521, 81, 8395, 154.5, 638.5, 942.5, 4102.800000000064, 0.47000722548421264, 185.53231686506788, 2.662596161673424], "isController": false}, {"data": ["2.0 Register attendance", 836, 21, 2.511961722488038, 2725.864832535885, 529, 15138, 2532.0, 4068.500000000002, 4813.15, 9175.709999999997, 0.47152810640291176, 939.0184559576674, 9.902068752894172], "isController": true}, {"data": ["Reset counters", 1, 0, 0.0, 368.0, 368, 368, 368.0, 368.0, 368.0, 368.0, 2.717391304347826, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 849, 0, 0.0, 1601.3309776207298, 748, 10783, 1391.0, 2516.0, 2888.5, 5020.5, 0.4756052062244341, 792.3582374636153, 9.039732072582732], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 200, 0, 0.0, 2564.1699999999996, 216, 18533, 2224.0, 3558.7, 4378.099999999996, 11840.230000000016, 0.11778909861892282, 139.2767450270915, 1.9554025626490767], "isController": true}, {"data": ["2.5 Select patient", 830, 0, 0.0, 219.70843373493986, 60, 6147, 118.0, 447.79999999999995, 718.6999999999996, 1479.8699999999985, 0.47275587627010424, 192.26327187809534, 1.948142796517612], "isController": false}, {"data": ["Initialise vaccination list", 1, 1, 100.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 1247.55859375, 0.0], "isController": false}, {"data": ["2.3 Search by first/last name", 840, 0, 0.0, 202.23690476190478, 63, 2604, 114.0, 449.79999999999995, 691.9499999999999, 1221.8200000000031, 0.4739981006218968, 192.91881895984642, 2.0309393575505923], "isController": false}, {"data": ["4.0 Vaccination for flu", 203, 0, 0.0, 2511.8226600985195, 235, 13637, 2025.0, 3928.5999999999995, 4917.599999999999, 11909.280000000017, 0.11940122930329677, 141.97324271020204, 1.9928348463738492], "isController": true}, {"data": ["4.0 Vaccination for hpv", 202, 0, 0.0, 2604.5990099009905, 335, 15572, 2246.0, 3798.100000000002, 4575.799999999999, 10146.83, 0.11937976891149882, 141.7023139969381, 1.995236425870187], "isController": true}, {"data": ["1.2 Sign-in page", 852, 0, 0.0, 269.4823943661975, 11, 3819, 152.0, 633.1000000000001, 906.3499999999999, 1515.8100000000006, 0.4748189891928523, 190.83781507176204, 2.3102694836357425], "isController": false}, {"data": ["2.4 Patient attending session", 726, 21, 2.8925619834710745, 1603.7782369145998, 128, 14560, 1300.5, 2466.9, 3030.25, 7886.930000000013, 0.4123484150996764, 168.06362368137962, 2.0764050978134745], "isController": false}, {"data": ["1.4 Open Sessions list", 849, 0, 0.0, 745.5995288574809, 469, 5774, 623.0, 1148.0, 1422.5, 2011.0, 0.4762169193308732, 219.05652914641064, 1.960967403786233], "isController": false}, {"data": ["Reset vaccination list", 1, 1, 100.0, 32.0, 32, 32, 32.0, 32.0, 32.0, 32.0, 31.25, 77.972412109375, 0.0], "isController": false}, {"data": ["4.2 Vaccination batch", 803, 0, 0.0, 289.0460772104609, 80, 6097, 149.0, 563.8000000000001, 930.5999999999999, 2185.1600000000144, 0.47128561786542245, 187.27763880788362, 2.429320798302374], "isController": false}, {"data": ["Add vaccination row to STS", 1536, 0, 0.0, 44.261067708333364, 0, 52, 44.0, 48.0, 48.0, 48.0, 12.83057954792255, 3.6712498120520576, 10.368086256619945], "isController": false}, {"data": ["1.1 Homepage", 853, 0, 0.0, 274.4103165298945, 28, 3779, 143.0, 625.6, 957.1999999999989, 1978.8600000000015, 0.47387098709604303, 190.25313492497227, 2.2923754217201795], "isController": false}, {"data": ["1.3 Sign-in", 849, 0, 0.0, 311.0859835100118, 72, 4977, 169.0, 670.0, 992.5, 1835.0, 0.4761506834641112, 191.7110534530669, 2.469779184244236], "isController": false}, {"data": ["2.2 Session register", 843, 0, 0.0, 228.19098457888495, 61, 1969, 127.0, 507.20000000000005, 726.7999999999997, 1231.0399999999995, 0.47475545588632, 201.39165574872257, 1.9621671282462037], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 198, 0, 0.0, 2502.818181818181, 228, 13018, 2212.5, 3785.4, 4661.649999999999, 9699.51999999997, 0.11741752604830723, 139.16637251284624, 1.9487671298753477], "isController": true}, {"data": ["Data prep Homepage", 1, 0, 0.0, 740.0, 740, 740, 740.0, 740.0, 740.0, 740.0, 1.3513513513513513, 525.3919446790541, 4.395850929054054], "isController": false}, {"data": ["2.1 Open session", 847, 0, 0.0, 681.1936245572604, 205, 5846, 531.0, 1250.2, 1545.9999999999986, 2398.52, 0.47546579649502557, 191.55120784082814, 1.9609433722762462], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 21, 91.30434782608695, 0.18390401961642877], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:9191 [localhost/127.0.0.1] failed: Connection refused", 2, 8.695652173913043, 0.017514668534897977], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 11419, 23, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 21, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:9191 [localhost/127.0.0.1] failed: Connection refused", 2, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Initialise vaccination list", 1, 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:9191 [localhost/127.0.0.1] failed: Connection refused", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 726, 21, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 21, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["Reset vaccination list", 1, 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:9191 [localhost/127.0.0.1] failed: Connection refused", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
