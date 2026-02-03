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

    var data = {"OkPercent": 99.88585041441263, "KoPercent": 0.11414958558737406};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.3181060082170606, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.026242127361791462, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.01818805765271105, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Get Next Patient from STS"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.5721056194989844, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.5973154362416108, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.34122748498999333, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.1963882618510158, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.0, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.31211286992429454, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.366577718478986, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.30561122244488975, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.5318578135479544, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.06697923643670463, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 20149, 23, 0.11414958558737406, 1447.1811504293062, 0, 28327, 1221.5, 2772.0, 3497.0, 6272.600000000064, 5.5946071419051595, 1834.0127933032456, 20.06904073096962], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 1429, 0, 0.0, 2853.0440867739694, 1232, 14411, 2508.0, 4317.0, 5520.5, 8803.800000000028, 0.4149426992879188, 157.2838481716787, 2.1523649619582623], "isController": false}, {"data": ["4.1 Vaccination questions", 1457, 0, 0.0, 2141.5133836650634, 679, 21176, 2004.0, 2635.6000000000004, 3209.199999999999, 5942.86000000001, 0.4163221127332847, 154.69553820276857, 2.0694970604037097], "isController": false}, {"data": ["Get Next Patient from STS", 1495, 0, 0.0, 0.6234113712374593, 0, 14, 1.0, 1.0, 1.0, 1.0, 0.4173471239339503, 0.17584967739346483, 0.2664453653881049], "isController": false}, {"data": ["2.0 Register attendance", 1487, 23, 1.546738399462004, 6557.581035642228, 2372, 33189, 5949.0, 9920.2, 12179.799999999994, 17153.119999999995, 0.4164941777643085, 735.3713416845621, 7.32915670800005], "isController": true}, {"data": ["1.0 Login", 1497, 0, 0.0, 6731.523714094853, 2961, 44146, 6479.0, 8472.0, 9620.2, 12647.88, 0.41669635778991154, 654.4931153113574, 6.926117219267183], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 362, 0, 0.0, 6497.513812154693, 2798, 24398, 6207.5, 8723.699999999999, 10459.199999999999, 15353.800000000008, 0.10404373745798731, 116.04381545037286, 1.5162910721276024], "isController": true}, {"data": ["2.5 Select patient", 1477, 0, 0.0, 879.5125253893021, 396, 19524, 689.0, 1535.4, 1900.1, 3763.2800000000075, 0.41769558730205414, 159.5778792777387, 1.4846756517408601], "isController": false}, {"data": ["2.3 Search by first/last name", 1490, 0, 0.0, 784.8664429530206, 402, 8557, 675.0, 1102.0, 1382.6000000000004, 3078.3599999999997, 0.4180114103087786, 159.67488592707076, 1.5457455165996818], "isController": false}, {"data": ["4.0 Vaccination for flu", 363, 0, 0.0, 6322.9421487603295, 2663, 18888, 6102.0, 8470.800000000001, 9660.4, 13497.640000000021, 0.10415680333301772, 115.61253072876765, 1.5132096713393761], "isController": true}, {"data": ["4.0 Vaccination for hpv", 362, 0, 0.0, 6351.5635359116, 2606, 16584, 6062.0, 8510.599999999999, 9703.099999999993, 14860.550000000003, 0.10434715433491805, 116.40243578677538, 1.5199089938599484], "isController": true}, {"data": ["1.2 Sign-in page", 1499, 0, 0.0, 1343.1054036024027, 306, 21151, 1121.0, 2079.0, 2484.0, 4483.0, 0.417257712169562, 157.75604716619662, 1.781724540616378], "isController": false}, {"data": ["2.4 Patient attending session", 886, 23, 2.595936794582393, 1862.161399548532, 476, 12904, 1628.0, 2772.0, 3611.5, 5981.319999999997, 0.24947402091301862, 95.1641811633845, 1.0880248651122688], "isController": false}, {"data": ["Debug Sampler", 1487, 0, 0.0, 0.46469401479488864, 0, 3, 0.0, 1.0, 1.0, 1.0, 0.41888267904628834, 2.6511358882735383, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1496, 0, 0.0, 2587.340909090912, 1537, 19543, 2404.5, 3404.2, 3797.149999999997, 5091.719999999997, 0.41720129879003254, 181.24750306260194, 1.4824172773278703], "isController": false}, {"data": ["4.2 Vaccination batch", 1453, 0, 0.0, 1456.5340674466631, 598, 13810, 1341.0, 1968.6000000000008, 2481.7999999999997, 4726.380000000002, 0.41628323533153105, 154.28553618141999, 1.8636995006785733], "isController": false}, {"data": ["1.1 Homepage", 1499, 0, 0.0, 1339.409606404267, 609, 8186, 1225.0, 1942.0, 2335.0, 4381.0, 0.4171085169440944, 157.94435987338153, 1.7729973352115274], "isController": false}, {"data": ["1.3 Sign-in", 1497, 0, 0.0, 1461.829659318637, 547, 9721, 1309.0, 2089.6000000000004, 2478.0, 4454.6399999999985, 0.4170033753038735, 158.39761275752466, 1.8973570879013588], "isController": false}, {"data": ["2.2 Session register", 1491, 0, 0.0, 847.0134138162305, 395, 8451, 738.0, 1169.3999999999999, 1518.9999999999973, 3255.5199999999895, 0.417710124861989, 163.62171544422253, 1.491365255759203], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 363, 0, 0.0, 6479.322314049583, 2562, 27706, 6052.0, 8719.800000000003, 10775.800000000003, 17345.640000000007, 0.1052834604904237, 118.08096092819842, 1.534190511491269], "isController": true}, {"data": ["2.1 Open session", 1493, 0, 0.0, 2935.5170797052947, 802, 28327, 2276.0, 5237.600000000007, 7034.4, 11599.919999999984, 0.41699705700067674, 157.87088283922347, 1.4851570658657047], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 23, 100.0, 0.11414958558737406], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 20149, 23, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 23, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 886, 23, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 23, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
