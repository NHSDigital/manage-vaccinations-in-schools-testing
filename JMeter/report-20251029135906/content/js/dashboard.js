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

    var data = {"OkPercent": 99.88992845349478, "KoPercent": 0.1100715465052284};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.37808743169398906, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.06788079470198675, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.39155629139072845, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.8650662251655629, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.8700331125827815, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.5229970326409495, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.31540697674418605, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.00370919881305638, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.4925496688741722, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.5089020771513353, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.4629080118694362, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.7433774834437086, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.445364238410596, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 7268, 8, 0.1100715465052284, 1103.759356081449, 263, 6307, 900.0, 1982.1000000000004, 2451.0, 3368.5499999999975, 4.914652873902098, 2008.2732308773225, 20.684262862082047], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 604, 0, 0.0, 1959.4205298013235, 1257, 6274, 1815.5, 2675.5, 3022.0, 3842.2500000000055, 0.4529596865878937, 182.74855984106478, 2.380477834738333], "isController": false}, {"data": ["4.1 Vaccination questions", 604, 0, 0.0, 1462.490066225166, 672, 3136, 1404.0, 1626.5, 1785.25, 2257.900000000001, 0.45417392605537166, 179.31228235345372, 2.2827076015199035], "isController": false}, {"data": ["2.0 Register attendance", 604, 8, 1.3245033112582782, 3412.9271523178786, 1766, 6978, 3417.5, 4587.0, 4962.0, 6059.150000000002, 0.4584628136561195, 855.3934593192056, 7.846964618236726], "isController": true}, {"data": ["1.0 Login", 674, 0, 0.0, 4986.066765578638, 3256, 9713, 4819.0, 5920.0, 6403.25, 7728.25, 0.4597647832454618, 764.5289517889471, 7.710574823435657], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 152, 0, 0.0, 4308.16447368421, 3317, 5988, 4179.0, 5174.900000000001, 5388.2, 5937.12, 0.11589932923263206, 138.69302606167028, 1.7181512622542572], "isController": true}, {"data": ["2.5 Select patient", 604, 0, 0.0, 474.9205298013242, 321, 2022, 396.0, 644.0, 843.25, 1558.1500000000008, 0.45630329361832644, 185.64000278862505, 1.6441875971722038], "isController": false}, {"data": ["2.3 Search by first/last name", 604, 0, 0.0, 465.360927152318, 321, 1567, 423.0, 627.5, 779.0, 1108.2000000000007, 0.45907365928069843, 186.82905115759337, 1.72934202973262], "isController": false}, {"data": ["4.0 Vaccination for flu", 150, 0, 0.0, 4236.513333333334, 3372, 6545, 4114.0, 4975.6, 5428.599999999999, 6266.5400000000045, 0.11337757074193526, 135.50639463080674, 1.6770579965956496], "isController": true}, {"data": ["4.0 Vaccination for hpv", 151, 0, 0.0, 4357.827814569535, 3554, 8604, 4152.0, 5250.400000000001, 5834.200000000002, 7565.039999999979, 0.11450506135120522, 136.62091594664975, 1.696451312315209], "isController": true}, {"data": ["1.2 Sign-in page", 674, 0, 0.0, 858.6053412462908, 263, 3038, 648.0, 1531.0, 1655.25, 2027.75, 0.46086068810466596, 184.90538696528364, 1.9734143928621979], "isController": false}, {"data": ["2.4 Patient attending session", 344, 8, 2.3255813953488373, 1473.4651162790688, 400, 3717, 1348.5, 2023.0, 2377.25, 3141.1500000000024, 0.29671901227071124, 120.95221091379321, 1.3119667791151217], "isController": false}, {"data": ["1.4 Open Sessions list", 674, 0, 0.0, 2343.181008902078, 1425, 6307, 2158.5, 3138.5, 3703.5, 4787.0, 0.46024073185104863, 211.14307645194341, 1.656460125671668], "isController": false}, {"data": ["4.2 Vaccination batch", 604, 0, 0.0, 882.9006622516566, 482, 2360, 873.5, 1108.0, 1269.0, 1650.8500000000001, 0.454826811889956, 180.77136702377598, 2.0613149158909256], "isController": false}, {"data": ["1.1 Homepage", 674, 0, 0.0, 770.1691394658752, 483, 2400, 690.5, 1139.0, 1179.75, 1733.0, 0.46101420388866166, 184.77073908241928, 1.9585936388504332], "isController": false}, {"data": ["1.3 Sign-in", 674, 0, 0.0, 1014.1112759643918, 458, 3110, 911.0, 1529.0, 1618.25, 2166.5, 0.4609070157706789, 185.32783705064983, 2.139121672314601], "isController": false}, {"data": ["2.2 Session register", 604, 0, 0.0, 545.7831125827813, 316, 1661, 504.5, 746.5, 848.5, 1245.3000000000025, 0.45897144802452305, 191.0569478358337, 1.660570180362861], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 151, 0, 0.0, 4316.2649006622505, 3334, 6797, 4216.0, 5076.4, 5367.6, 6462.639999999993, 0.11469884716264676, 137.3932970772303, 1.7000789765178796], "isController": true}, {"data": ["2.1 Open session", 604, 0, 0.0, 1087.6705298013248, 518, 4149, 1004.5, 1536.5, 1844.75, 2683.650000000004, 0.4588874107581747, 185.18321049603335, 1.6562329412973598], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 8, 100.0, 0.1100715465052284], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 7268, 8, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 8, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 344, 8, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 8, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
