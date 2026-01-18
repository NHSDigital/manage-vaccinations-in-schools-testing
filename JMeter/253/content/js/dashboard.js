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

    var data = {"OkPercent": 99.94033921418222, "KoPercent": 0.059660785817778915};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8025961472070704, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.45852534562211983, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.984814398200225, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.3564516129032258, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.4294117647058823, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.3931818181818182, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.9821814254859611, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.9812231759656652, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.39414414414414417, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.4072398190045249, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.9567307692307693, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.5738304093567251, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.8775401069518717, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9819209039548022, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9578891257995735, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9433155080213904, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.9625267665952891, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.3963963963963964, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.9074866310160428, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 11733, 7, 0.059660785817778915, 299.2807466121197, 0, 6411, 133.0, 709.0, 1015.0, 2154.66, 5.817992487634349, 2276.657760937713, 43.706390450091114], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 868, 0, 0.0, 1010.9481566820276, 422, 6411, 766.0, 1722.4, 2327.4999999999995, 4383.989999999998, 0.5177687744866455, 216.8848383476898, 5.297875912134997], "isController": false}, {"data": ["4.1 Vaccination questions", 889, 0, 0.0, 153.5095613048369, 83, 2000, 118.0, 234.0, 329.5, 748.1, 0.5181202202098357, 212.33337325294698, 4.823757212667661], "isController": false}, {"data": ["2.0 Register attendance", 930, 7, 0.7526881720430108, 1437.0182795698922, 398, 6837, 1170.5, 2613.4999999999995, 3371.6499999999974, 4519.279999999993, 0.524481735910475, 1057.7260376173244, 18.50874963659901], "isController": true}, {"data": ["Reset counters", 1, 0, 0.0, 26.0, 26, 26, 26.0, 26.0, 26.0, 26.0, 38.46153846153847, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 935, 0, 0.0, 1091.6374331550799, 451, 6463, 806.0, 1926.0, 2684.6, 4702.199999999999, 0.5252428335249861, 908.0584100225321, 16.999152629001888], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 220, 0, 0.0, 1327.0136363636361, 333, 6398, 1035.0, 2337.1000000000004, 3072.6999999999975, 5343.669999999993, 0.13114754098360656, 161.8465647121833, 3.69390368852459], "isController": true}, {"data": ["2.5 Select patient", 926, 0, 0.0, 139.87473002159828, 56, 2854, 95.0, 189.9000000000002, 347.0, 1070.5200000000004, 0.5300703287695385, 223.43282027163383, 3.794217479562812], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 43.0, 43, 43, 43.0, 43.0, 43.0, 43.0, 23.25581395348837, 6.676962209302326, 14.353197674418606], "isController": false}, {"data": ["2.3 Search by first/last name", 932, 0, 0.0, 145.6266094420602, 58, 2143, 94.0, 246.0, 371.44999999999936, 1017.0999999999947, 0.525589794083844, 223.6367754829984, 3.9020942649102266], "isController": false}, {"data": ["4.0 Vaccination for flu", 222, 0, 0.0, 1331.2162162162163, 253, 6632, 1046.0, 2399.6000000000004, 3019.25, 5294.090000000002, 0.13054001227781736, 160.6551724247234, 3.6669381288853296], "isController": true}, {"data": ["4.0 Vaccination for hpv", 221, 0, 0.0, 1257.1040723981903, 238, 6528, 1022.0, 2105.4000000000005, 2549.4999999999964, 4626.400000000001, 0.12957917258128163, 159.45003995938046, 3.6487996877127284], "isController": true}, {"data": ["1.2 Sign-in page", 936, 0, 0.0, 212.38568376068355, 14, 4147, 118.5, 401.1000000000005, 690.5999999999999, 1652.469999999999, 0.5223406665647283, 217.67446698389142, 4.310230965014616], "isController": false}, {"data": ["Debug Sampler", 932, 0, 0.0, 0.29828326180257514, 0, 3, 0.0, 1.0, 1.0, 1.0, 0.5256345542681018, 3.0099127954931912, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 684, 7, 1.023391812865497, 809.7938596491239, 56, 5741, 606.0, 1270.5, 1851.25, 3557.899999999996, 0.3885869071209119, 165.74553885790957, 3.379998618073609], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 29.0, 29, 29, 29.0, 29.0, 29.0, 29.0, 34.48275862068965, 10.809536637931034, 20.339439655172413], "isController": false}, {"data": ["1.4 Open Sessions list", 935, 0, 0.0, 427.41390374331536, 193, 3534, 320.0, 712.4, 965.5999999999995, 1943.159999999999, 0.5255779389924868, 251.16261063485882, 3.7606703344347987], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 1.0, 1, 1, 1.0, 1.0, 1.0, 1.0, 1000.0, 286.1328125, 614.2578125], "isController": false}, {"data": ["4.2 Vaccination batch", 885, 0, 0.0, 155.10960451977405, 72, 2522, 112.0, 234.5999999999999, 342.69999999999993, 899.0399999999995, 0.5170096163788647, 213.24097397875266, 4.549486660750265], "isController": false}, {"data": ["1.1 Homepage", 938, 0, 0.0, 205.96268656716435, 28, 4725, 125.0, 401.1, 605.0999999999999, 1579.9000000000012, 0.521194212632792, 217.08860934094076, 4.287472893247424], "isController": false}, {"data": ["1.3 Sign-in", 935, 0, 0.0, 245.67379679144392, 64, 4277, 129.0, 480.79999999999984, 725.9999999999997, 1996.679999999998, 0.525406051778626, 219.47467281620033, 4.588233025731972], "isController": false}, {"data": ["2.2 Session register", 934, 0, 0.0, 185.18201284796575, 56, 2755, 99.0, 407.0, 590.25, 1351.1499999999996, 0.5250237918972077, 227.08550914835686, 3.766957435832143], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 222, 0, 0.0, 1285.6891891891887, 223, 3702, 1084.0, 2087.9, 2617.7, 3592.1000000000004, 0.1305143795099479, 161.46191280287272, 3.6760895727682334], "isController": true}, {"data": ["2.1 Open session", 935, 0, 0.0, 370.4909090909095, 93, 2974, 261.0, 681.4, 1040.799999999999, 2047.159999999998, 0.5255664172615123, 220.48410294648133, 3.766233625936113], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 7, 100.0, 0.059660785817778915], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 11733, 7, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 7, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 684, 7, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 7, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
