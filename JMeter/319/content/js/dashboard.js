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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9005662254189303, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9377669310555217, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9972989195678271, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.5716824644549763, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.49941176470588233, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.5012019230769231, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.9988137603795967, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.9979289940828402, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.5060975609756098, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.5, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.9982384028185555, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.9829612220916569, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.9720259128386337, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9987966305655837, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [1.0, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9985294117647059, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.9973404255319149, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.5059523809523809, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.9920494699646644, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 21088, 0, 0.0, 168.115326251896, 0, 11181, 93.0, 381.0, 419.0, 557.9900000000016, 5.520493996253352, 2297.867177998071, 42.04087517192642], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 1639, 0, 0.0, 441.8364856619883, 330, 11181, 401.0, 529.0, 589.0, 785.7999999999997, 0.47229250899127945, 210.3210267131986, 4.881003345849518], "isController": false}, {"data": ["4.1 Vaccination questions", 1666, 0, 0.0, 128.58583433373323, 78, 9080, 104.0, 148.29999999999995, 198.0, 376.3099999999995, 0.47373621764567886, 207.6139415711706, 4.453127499218023], "isController": false}, {"data": ["2.0 Register attendance", 1688, 0, 0.0, 738.6635071090044, 384, 10964, 698.0, 906.2000000000003, 1010.6499999999999, 1518.509999999996, 0.47236364837115696, 965.3157838022818, 15.892046345331128], "isController": true}, {"data": ["Reset counters", 1, 0, 0.0, 14.0, 14, 14, 14.0, 14.0, 14.0, 14.0, 71.42857142857143, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1700, 0, 0.0, 684.6805882352951, 232, 10694, 636.0, 788.0, 864.0, 1059.89, 0.47336816766143597, 869.8558944169706, 15.65101567057474], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 416, 0, 0.0, 689.379807692307, 200, 9594, 610.0, 780.3, 863.0499999999998, 1196.6999999999985, 0.11946995546010723, 157.8967723358918, 3.409083749802918], "isController": true}, {"data": ["2.5 Select patient", 1686, 0, 0.0, 95.06880189798345, 60, 7438, 83.0, 108.0, 136.0, 260.2999999999988, 0.4745928170968262, 213.23690437598646, 3.4319238290843765], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 45.0, 45, 45, 45.0, 45.0, 45.0, 45.0, 22.22222222222222, 6.380208333333334, 13.715277777777779], "isController": false}, {"data": ["2.3 Search by first/last name", 1690, 0, 0.0, 104.26745562130182, 67, 10335, 83.0, 109.90000000000009, 151.79999999999927, 288.26999999999975, 0.472852925952351, 214.189514193457, 3.5452370538149998], "isController": false}, {"data": ["4.0 Vaccination for flu", 410, 0, 0.0, 670.8463414634149, 192, 8536, 614.5, 768.8000000000001, 835.1499999999999, 2029.4999999999884, 0.11724908481369836, 154.24920792970573, 3.3270961012999205], "isController": true}, {"data": ["4.0 Vaccination for hpv", 416, 0, 0.0, 693.4326923076923, 191, 11244, 615.5, 803.6, 882.8499999999996, 1841.0999999999863, 0.11991289020331865, 157.96904455765548, 3.4207441620834578], "isController": true}, {"data": ["1.2 Sign-in page", 1703, 0, 0.0, 94.75513799177925, 15, 10107, 80.0, 113.0, 157.79999999999995, 287.72000000000025, 0.47357846511078205, 210.23448579942436, 4.02881235835054], "isController": false}, {"data": ["Debug Sampler", 1690, 0, 0.0, 0.27278106508875766, 0, 13, 0.0, 1.0, 1.0, 1.0, 0.47287343360675116, 2.6970451159554214, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 851, 0, 0.0, 322.3795534665107, 243, 1322, 300.0, 393.0, 472.4, 638.3200000000002, 0.23889918847265093, 108.61101600854408, 2.102534589500451], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 29.0, 29, 29, 29.0, 29.0, 29.0, 29.0, 34.48275862068965, 10.809536637931034, 20.339439655172413], "isController": false}, {"data": ["1.4 Open Sessions list", 1698, 0, 0.0, 385.73674911660777, 308, 1084, 368.0, 459.0, 506.04999999999995, 618.05, 0.4739160565718453, 239.98844017380202, 3.4265976237421896], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 3.0, 3, 3, 3.0, 3.0, 3.0, 3.0, 333.3333333333333, 95.37760416666667, 204.75260416666666], "isController": false}, {"data": ["4.2 Vaccination batch", 1662, 0, 0.0, 115.21480144404319, 77, 10729, 92.0, 131.0, 168.8499999999999, 309.3999999999978, 0.4735589149175332, 208.49352420382553, 4.209703539065761], "isController": false}, {"data": ["1.1 Homepage", 1709, 0, 0.0, 92.87244002340545, 24, 486, 85.0, 123.0, 156.5, 272.30000000000064, 0.4747040252345882, 210.5237029281933, 4.03021144823129], "isController": false}, {"data": ["1.3 Sign-in", 1700, 0, 0.0, 111.83764705882356, 62, 9673, 82.0, 143.0, 273.0, 322.99, 0.4733474743570967, 210.34666865052046, 4.187064585582894], "isController": false}, {"data": ["2.2 Session register", 1692, 0, 0.0, 117.32801418439709, 63, 8955, 82.0, 188.0, 233.0, 337.6299999999994, 0.47275286620395374, 217.42770438755593, 3.426332475223084], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 420, 0, 0.0, 664.680952380953, 186, 11392, 609.0, 787.9000000000001, 847.6499999999999, 1029.0100000000004, 0.12100548644637714, 159.25545323064122, 3.446830083465695], "isController": true}, {"data": ["2.1 Open session", 1698, 0, 0.0, 259.263250883392, 115, 9774, 221.0, 352.10000000000014, 401.0, 601.01, 0.4737957203801639, 211.78843640750395, 3.4297337211547556], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 21088, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
