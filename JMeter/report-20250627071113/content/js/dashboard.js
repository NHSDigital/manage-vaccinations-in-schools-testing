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

    var data = {"OkPercent": 99.906191369606, "KoPercent": 0.09380863039399624};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.4942396313364055, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.6810344827586207, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.7857142857142857, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [0.8333333333333334, 500, 1500, "2.5 Select menacwy"], "isController": false}, {"data": [0.26119402985074625, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.8913043478260869, 500, 1500, "2.5 Select td_ipv"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.021739130434782608, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.24603174603174602, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "5.4 Consent route"], "isController": false}, {"data": [1.0, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.7428571428571429, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.14788732394366197, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.45, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.5, 500, 1500, "5.6 Consent questions"], "isController": false}, {"data": [0.6618705035971223, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "5.3 Consent parent details"], "isController": false}, {"data": [0.5, 500, 1500, "5.2 Consent who"], "isController": false}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.782608695652174, 500, 1500, "2.5 Select hpv"], "isController": false}, {"data": [0.7272727272727273, 500, 1500, "2.5 Select flu"], "isController": false}, {"data": [0.5, 500, 1500, "5.1 Consent start"], "isController": false}, {"data": [1.0, 500, 1500, "5.5 Consent agree"], "isController": false}, {"data": [0.7571428571428571, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.822463768115942, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "5.7 Consent triage"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for flu"], "isController": true}, {"data": [0.35, 500, 1500, "2.2 Session register"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1066, 1, 0.09380863039399624, 1032.286116322702, 91, 7358, 647.5, 2026.8000000000004, 3197.9499999999994, 5476.609999999999, 1.7764594130684752, 49.70561051731464, 2.27079627168497], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["2.0 Register attendance", 62, 0, 0.0, 9073.000000000002, 4400, 16511, 9213.0, 13393.1, 15610.5, 16511.0, 0.12124388402826937, 32.53610794421217, 0.5172573313438907], "isController": true}, {"data": ["2.5 Select patient", 58, 0, 0.0, 938.0172413793099, 371, 5596, 449.0, 2480.9, 2729.8499999999985, 5596.0, 0.11652248683094997, 2.944529441892446, 0.08079195864255322], "isController": false}, {"data": ["1.4 Select Organisations", 35, 0, 0.0, 590.5999999999999, 419, 2141, 454.0, 998.5999999999988, 1763.399999999998, 2141.0, 0.5074155153166998, 7.2911248948925, 0.7333739869811676], "isController": false}, {"data": ["2.5 Select menacwy", 24, 0, 0.0, 488.375, 375, 879, 422.5, 679.5, 830.0, 879.0, 0.08747471434038598, 2.0260953417436625, 0.06099311136624569], "isController": false}, {"data": ["2.3 Search by first/last name", 67, 0, 0.0, 2085.2686567164174, 734, 5763, 1384.0, 3973.0000000000005, 4644.2, 5763.0, 0.1280187098389066, 8.788179908323318, 0.11043031841310301], "isController": false}, {"data": ["2.5 Select td_ipv", 23, 0, 0.0, 467.1304347826087, 377, 721, 415.0, 666.2, 710.9999999999999, 721.0, 0.23994074506817445, 5.63563270027228, 0.1670681164390707], "isController": false}, {"data": ["4.0 Vaccination for flu", 46, 0, 0.0, 2210.7608695652175, 2090, 2521, 2176.0, 2379.3, 2458.5, 2521.0, 0.1395334728668062, 7.2997298908757235, 0.8154224300057633], "isController": true}, {"data": ["4.0 Vaccination for hpv", 46, 0, 0.0, 2297.6304347826076, 961, 6177, 2201.0, 2557.0000000000005, 3870.449999999997, 6177.0, 0.1374833376172344, 6.5832173006342165, 0.7583707458620503], "isController": true}, {"data": ["1.2 Sign-in page", 35, 0, 0.0, 93.85714285714285, 91, 115, 93.0, 96.4, 105.39999999999995, 115.0, 0.5936026593399139, 3.577267588658797, 0.35766878985617856], "isController": false}, {"data": ["2.4 Patient attending session", 63, 0, 0.0, 2369.619047619047, 935, 7358, 1528.0, 5473.6, 6584.999999999999, 7358.0, 0.12312214302884379, 7.455498841943414, 0.18299990399404323], "isController": false}, {"data": ["5.4 Consent route", 1, 0, 0.0, 469.0, 469, 469, 469.0, 469.0, 469.0, 469.0, 2.1321961620469083, 27.77893456823028, 3.316980943496802], "isController": false}, {"data": ["1.1 Homepage", 35, 0, 0.0, 281.51428571428573, 264, 478, 272.0, 292.0, 389.19999999999953, 478.0, 0.6024096385542169, 3.1091161521084336, 0.3265013177710843], "isController": false}, {"data": ["1.3 Sign-in", 35, 0, 0.0, 596.5428571428571, 455, 1303, 505.0, 889.5999999999997, 1098.9999999999989, 1303.0, 0.5070479667376534, 4.92044496628131, 0.797709252357773], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 23, 0, 0.0, 2918.0434782608695, 2122, 8374, 2444.0, 4014.6000000000004, 7532.599999999988, 8374.0, 0.23356893330083678, 13.120867718107686, 1.3845841806554149], "isController": true}, {"data": ["2.1 Open session", 71, 0, 0.0, 2206.507042253522, 1243, 6230, 1725.0, 4419.199999999999, 5172.799999999998, 6230.0, 0.13052718274540948, 2.2829635857885315, 0.08271054287358351], "isController": false}, {"data": ["4.3 Vaccination confirm", 130, 0, 0.0, 1271.9923076923078, 943, 7307, 1182.0, 1526.8000000000006, 2002.2999999999984, 6040.029999999991, 0.32708845981592466, 6.838370023852296, 0.7612693965029211], "isController": false}, {"data": ["5.6 Consent questions", 1, 0, 0.0, 648.0, 648, 648, 648.0, 648.0, 648.0, 648.0, 1.5432098765432098, 19.178602430555554, 3.8022641782407405], "isController": false}, {"data": ["4.1 Vaccination questions", 139, 0, 0.0, 633.9136690647482, 459, 5471, 627.0, 693.0, 770.0, 3811.3999999999764, 0.31661427725388364, 3.6759140920402262, 0.6217261065839825], "isController": false}, {"data": ["5.3 Consent parent details", 1, 0, 0.0, 459.0, 459, 459, 459.0, 459.0, 459.0, 459.0, 2.1786492374727673, 24.62894880174292, 3.936036220043573], "isController": false}, {"data": ["5.2 Consent who", 1, 0, 0.0, 502.0, 502, 502, 502.0, 502.0, 502.0, 502.0, 1.9920318725099602, 39.30566795318725, 3.100877739043825], "isController": false}, {"data": ["1.0 Login", 35, 0, 0.0, 2319.1142857142863, 1614, 5817, 1841.0, 4014.9999999999995, 4694.599999999994, 5817.0, 0.566985258383282, 26.718626604770776, 2.699270639275879], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 23, 0, 0.0, 2252.565217391304, 2118, 2574, 2249.0, 2400.2000000000003, 2543.3999999999996, 2574.0, 0.24385330633276434, 12.868200683982018, 1.4456943490972125], "isController": true}, {"data": ["2.5 Select hpv", 46, 0, 0.0, 511.0000000000001, 373, 748, 427.5, 683.6, 697.15, 748.0, 0.1382959533401479, 3.019557556295472, 0.10304669179544225], "isController": false}, {"data": ["2.5 Select flu", 55, 0, 0.0, 641.4909090909089, 373, 2825, 500.0, 1114.0, 1854.599999999998, 2825.0, 0.11257135488835991, 2.364482157696094, 0.07805240426829643], "isController": false}, {"data": ["5.1 Consent start", 1, 0, 0.0, 988.0, 988, 988, 988.0, 988.0, 988.0, 988.0, 1.0121457489878543, 12.71508097165992, 2.151798140182186], "isController": false}, {"data": ["5.5 Consent agree", 1, 0, 0.0, 470.0, 470, 470, 470.0, 470.0, 470.0, 470.0, 2.127659574468085, 54.04338430851064, 3.2704454787234045], "isController": false}, {"data": ["1.5 Open Sessions list", 35, 0, 0.0, 756.6, 329, 4263, 420.0, 1920.3999999999987, 3215.7999999999943, 4263.0, 0.4758344096254503, 5.644957429814424, 0.2843854088777105], "isController": false}, {"data": ["4.2 Vaccination batch", 138, 0, 0.0, 533.3840579710144, 455, 1960, 484.5, 633.1, 670.8499999999993, 1911.2499999999982, 0.3173486212582183, 6.427133763449947, 0.5098728226837574], "isController": false}, {"data": ["5.7 Consent triage", 1, 1, 100.0, 371.0, 371, 371, 371.0, 371.0, 371.0, 371.0, 2.6954177897574128, 32.9925454851752, 2.661198618598383], "isController": false}, {"data": ["5.0 Consent for flu", 1, 1, 100.0, 3910.0, 3910, 3910, 3910.0, 3910.0, 3910.0, 3910.0, 0.25575447570332477, 27.287803708439895, 3.0775455562659846], "isController": true}, {"data": ["2.2 Session register", 70, 0, 0.0, 1527.742857142857, 712, 5415, 1159.0, 2799.9, 3560.25, 5415.0, 0.1296661282435056, 12.164189691473341, 0.08325730402353997], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["422/Unprocessable Entity", 1, 100.0, 0.09380863039399624], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1066, 1, "422/Unprocessable Entity", 1, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["5.7 Consent triage", 1, 1, "422/Unprocessable Entity", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
